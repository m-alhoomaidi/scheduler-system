package com.scheduler.scheduler_engine.service;

import com.scheduler.scheduler_engine.config.SchedulerConfig;
import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.domain.entity.TaskStatus;
import com.scheduler.scheduler_engine.domain.repository.ScheduledTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PreDestroy;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class TaskExecutionService {

    private final ScheduledTaskRepository scheduledTaskRepository;
    private final SchedulerConfig config;
    private final TaskExecutor taskExecutor;
    private final TaskRetryService retryService;
    
    // Thread pool for parallel task execution - properly configured
    private final Executor executorService;

    public TaskExecutionService(ScheduledTaskRepository scheduledTaskRepository,
                               SchedulerConfig config,
                               TaskExecutor taskExecutor,
                               TaskRetryService retryService) {
        this.scheduledTaskRepository = scheduledTaskRepository;
        this.config = config;
        this.taskExecutor = taskExecutor;
        this.retryService = retryService;
        this.executorService = Executors.newFixedThreadPool(
            config.getExecutor().getThreadPoolSize(),
            r -> {
                Thread t = new Thread(r, "task-executor");
                t.setDaemon(true);
                return t;
            }
        );
    }

  
    @Transactional
    public void executePendingTasks() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<ScheduledTask> pendingTasks = scheduledTaskRepository.findPendingTasksForExecution(now);
            
            if (pendingTasks.isEmpty()) {
                return; // Silent - no need to log when no tasks are due
            }

            log.info("⏰ Found {} tasks due for execution", pendingTasks.size());

            // Limit concurrent executions for safety
            int maxConcurrent = Math.min(pendingTasks.size(), config.getTask().getMaxConcurrentTasks());
            
            // Execute tasks in parallel with proper error handling
            List<CompletableFuture<Void>> futures = pendingTasks.stream()
                .limit(maxConcurrent)
                .map(task -> CompletableFuture.runAsync(() -> {
                    try {
                        executeTask(task);
                    } catch (Exception e) {
                        log.error("Task execution failed: taskId={}, error={}", 
                                task.getId(), e.getMessage());
                        handleTaskExecutionError(task, e);
                    }
                }, executorService))
                .toList();

            // Don't block - let tasks execute asynchronously
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .whenComplete((result, throwable) -> {
                    if (throwable != null) {
                        log.error("Error in batch execution", throwable);
                    } else {
                        log.debug("Batch execution completed: {} tasks", futures.size());
                    }
                });

        } catch (Exception e) {
            log.error("Error in task execution cycle: error={}", e.getMessage(), e);
        }
    }

    @Transactional
    public void cleanupOldTasks() {
        if (!config.getTask().isCleanupEnabled()) {
            return;
        }

        try {
            LocalDateTime threshold = LocalDateTime.now().minusHours(24);
            List<ScheduledTask> staleTasks = scheduledTaskRepository.findStaleTasks(threshold);
            
            if (!staleTasks.isEmpty()) {
                log.info("Cleaning up {} stale tasks older than 24 hours", staleTasks.size());
                staleTasks.forEach(task -> {
                    task.markAsDeleted();
                    scheduledTaskRepository.save(task);
                });
            }

        } catch (Exception e) {
            log.error("Error during task cleanup", e);
        }
    }

   
    @Transactional
    private void executeTask(ScheduledTask task) {
        // Mark task as running
        task.setStatus(TaskStatus.RUNNING);
        scheduledTaskRepository.save(task);

        try {
            // Use the injected task executor (strategy pattern)
            taskExecutor.execute(task);
            
            // Success: increment count and schedule next execution
            task.incrementExecutionCount();
            task.calculateNextExecutionTime();
            task.setStatus(TaskStatus.PENDING);
            scheduledTaskRepository.save(task);

        } catch (Exception e) {
            throw new RuntimeException("Task execution failed", e);
        }
    }

    @Transactional
    private void handleTaskExecutionError(ScheduledTask task, Exception error) {
        if (retryService.shouldRetry(task, error)) {
            retryService.scheduleRetry(task, error);
            task.setStatus(TaskStatus.PENDING);
        } else {
            log.error("Task permanently failed: taskId={}, error={}", task.getId(), error.getMessage());
            task.setStatus(TaskStatus.FAILED);
        }
        
        scheduledTaskRepository.save(task);
    }

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down TaskExecutionService...");
        if (executorService instanceof java.util.concurrent.ExecutorService) {
            java.util.concurrent.ExecutorService es = (java.util.concurrent.ExecutorService) executorService;
            es.shutdown();
            try {
                if (!es.awaitTermination(config.getExecutor().getShutdownTimeoutSeconds(), TimeUnit.SECONDS)) {
                    es.shutdownNow();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                es.shutdownNow();
            }
        }
    }

 
    public TaskExecutionStats getExecutionStats() {
        long pendingCount = scheduledTaskRepository.countByStatusAndDeletedAtIsNull(TaskStatus.PENDING);
        long runningCount = scheduledTaskRepository.countByStatusAndDeletedAtIsNull(TaskStatus.RUNNING);
        long completedCount = scheduledTaskRepository.countByStatusAndDeletedAtIsNull(TaskStatus.COMPLETED);
        long failedCount = scheduledTaskRepository.countByStatusAndDeletedAtIsNull(TaskStatus.FAILED);
        
        return new TaskExecutionStats(pendingCount, runningCount, completedCount, failedCount);
    }

    public static class TaskExecutionStats {
        private final long pendingCount;
        private final long runningCount;
        private final long completedCount;
        private final long failedCount;

        public TaskExecutionStats(long pendingCount, long runningCount, long completedCount, long failedCount) {
            this.pendingCount = pendingCount;
            this.runningCount = runningCount;
            this.completedCount = completedCount;
            this.failedCount = failedCount;
        }

        // Getters
        public long getPendingCount() { return pendingCount; }
        public long getRunningCount() { return runningCount; }
        public long getCompletedCount() { return completedCount; }
        public long getFailedCount() { return failedCount; }
        public long getTotalCount() { return pendingCount + runningCount + completedCount + failedCount; }
    }
}
