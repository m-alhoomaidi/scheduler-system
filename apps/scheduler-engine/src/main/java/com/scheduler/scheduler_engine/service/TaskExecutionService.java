package com.scheduler.scheduler_engine.service;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.domain.entity.TaskStatus;
import com.scheduler.scheduler_engine.domain.repository.ScheduledTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskExecutionService {

    private final ScheduledTaskRepository scheduledTaskRepository;

    @Value("${scheduler.task.max-retries:3}")
    private int maxRetries;

    @Value("${scheduler.task.cleanup-enabled:true}")
    private boolean cleanupEnabled;

    @Value("${scheduler.task.cleanup-interval:3600000}")
    private long cleanupInterval;

  
    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void executePendingTasks() {
        try {
            List<ScheduledTask> pendingTasks = scheduledTaskRepository.findPendingTasksForExecution();
            
            if (pendingTasks.isEmpty()) {
                log.debug("No pending tasks to execute");
                return;
            }

            log.info("Executing {} pending tasks", pendingTasks.size());

            for (ScheduledTask task : pendingTasks) {
                try {
                    executeTask(task);
                } catch (Exception e) {
                    log.error("Error executing task: taskId={}, error={}", 
                            task.getId(), e.getMessage(), e);
                    handleTaskExecutionError(task, e);
                }
            }

        } catch (Exception e) {
            log.error("Error in task execution cycle: error={}", e.getMessage(), e);
        }
    }

    @Scheduled(fixedDelay = 3600000) // 1 hour
    @Transactional
    public void cleanupOldTasks() {
        if (!cleanupEnabled) {
            return;
        }

        try {
            LocalDateTime threshold = LocalDateTime.now().minusHours(24); // Clean up tasks older than 24 hours
            
            List<ScheduledTask> staleTasks = scheduledTaskRepository.findStaleTasks(threshold);
            
            if (!staleTasks.isEmpty()) {
                log.info("Cleaning up {} stale tasks", staleTasks.size());
                
                for (ScheduledTask task : staleTasks) {
                    task.markAsDeleted();
                    scheduledTaskRepository.save(task);
                    log.debug("Marked stale task as deleted: taskId={}", task.getId());
                }
            }

        } catch (Exception e) {
            log.error("Error during task cleanup: error={}", e.getMessage(), e);
        }
    }

   
    private void executeTask(ScheduledTask task) {
        log.info("Executing task: taskId={}, ssuuid={}, message={}", 
                task.getId(), task.getSsuuid(), task.getMessage());

        // Mark task as running
        task.setStatus(TaskStatus.RUNNING);
        scheduledTaskRepository.save(task);

        try {
            // Simulate task execution - in real implementation, this would be the actual task logic
            performTaskExecution(task);
            
            // Mark task as completed
            task.setStatus(TaskStatus.COMPLETED);
            task.incrementExecutionCount();
            scheduledTaskRepository.save(task);
            
            log.info("Task completed successfully: taskId={}, executionCount={}", 
                    task.getId(), task.getExecutionCount());

        } catch (Exception e) {
            throw e; // Re-throw to be handled by the caller
        }
    }

    
    private void performTaskExecution(ScheduledTask task) {
        // Simulate some work
        try {
            Thread.sleep(100); // Simulate processing time
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Task execution interrupted", e);
        }

        // Log the task message (this is the main requirement - log every 5 seconds)
        log.info("Task execution: [{}] {}", task.getSsuuid(), task.getMessage());
    }

    
    private void handleTaskExecutionError(ScheduledTask task, Exception error) {
        task.incrementExecutionCount();
        
        if (task.getExecutionCount() >= maxRetries) {
            task.setStatus(TaskStatus.FAILED);
            log.error("Task failed after {} retries: taskId={}, finalError={}", 
                    maxRetries, task.getId(), error.getMessage());
        } else {
            task.setStatus(TaskStatus.PENDING);
            log.warn("Task execution failed, will retry: taskId={}, attempt={}/{}, error={}", 
                    task.getId(), task.getExecutionCount(), maxRetries, error.getMessage());
        }
        
        scheduledTaskRepository.save(task);
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
