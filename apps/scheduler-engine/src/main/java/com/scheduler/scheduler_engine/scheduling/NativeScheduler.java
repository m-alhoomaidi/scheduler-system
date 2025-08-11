package com.scheduler.scheduler_engine.scheduling;

import com.scheduler.scheduler_engine.service.TaskExecutionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Objects;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class NativeScheduler implements InitializingBean, DisposableBean {
    private final TaskExecutionService taskExecutionService;
    private final String executionCronExpression;
    private final long cleanupIntervalMillis;

    private ScheduledExecutorService executor;
    private ScheduledFuture<?> executionFuture;
    private ScheduledFuture<?> cleanupFuture;

    public NativeScheduler(
            TaskExecutionService taskExecutionService,
            @Value("${scheduler.task.execution-cron:*/5 * * * * *}") String executionCronExpression,
            @Value("${scheduler.task.cleanup-interval:3600000}") long cleanupIntervalMillis
    ) {
        this.taskExecutionService = Objects.requireNonNull(taskExecutionService);
        this.executionCronExpression = executionCronExpression;
        this.cleanupIntervalMillis = cleanupIntervalMillis;
    }

    @Override
    public void afterPropertiesSet() {
        this.executor = Executors.newScheduledThreadPool(2, new SchedulerThreadFactory());
        startExecutionLoop();
        startCleanupLoop();
        log.info("NativeScheduler started: cron={}, cleanupIntervalMs={}", executionCronExpression, cleanupIntervalMillis);
    }

    private void startExecutionLoop() {
        CronExpression cron = CronExpression.parse(executionCronExpression);
        this.executionFuture = executor.scheduleWithFixedDelay(() -> {
            try {
                // Ensure we are on second boundaries per matching
                ZonedDateTime now = ZonedDateTime.now().withNano(0);
                ZonedDateTime next = cron.nextExecutionAfter(now.minusSeconds(1));
                long delayMs = Math.max(0, next.toInstant().toEpochMilli() - now.toInstant().toEpochMilli());
                if (delayMs > 0) {
                    Thread.sleep(delayMs);
                }
                runExecutePendingTasks();
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            } catch (Throwable t) {
                log.error("Execution loop error: {}", t.getMessage(), t);
            }
        }, 0, 250, TimeUnit.MILLISECONDS); // small cadence to compute next match
    }

    private void startCleanupLoop() {
        this.cleanupFuture = executor.scheduleWithFixedDelay(() -> {
            try {
                runCleanupOldTasks();
            } catch (Throwable t) {
                log.error("Cleanup loop error: {}", t.getMessage(), t);
            }
        }, cleanupIntervalMillis, cleanupIntervalMillis, TimeUnit.MILLISECONDS);
    }

    @Transactional
    protected void runExecutePendingTasks() {
        taskExecutionService.executePendingTasks();
    }

    @Transactional
    protected void runCleanupOldTasks() {
        taskExecutionService.cleanupOldTasks();
    }

    @Override
    public void destroy() {
        if (executionFuture != null) executionFuture.cancel(true);
        if (cleanupFuture != null) cleanupFuture.cancel(true);
        if (executor != null) {
            executor.shutdownNow();
            try {
                if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                    log.warn("Scheduler executor did not terminate in time");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        log.info("NativeScheduler stopped");
    }

    private static final class SchedulerThreadFactory implements ThreadFactory {
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, "native-scheduler");
            t.setDaemon(true);
            return t;
        }
    }
}


