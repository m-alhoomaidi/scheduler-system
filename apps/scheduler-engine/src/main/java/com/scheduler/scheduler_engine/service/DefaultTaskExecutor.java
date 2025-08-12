package com.scheduler.scheduler_engine.service;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.logger.AppLogger;

import org.springframework.stereotype.Component;


@Component
public class DefaultTaskExecutor implements TaskExecutor {

    private final AppLogger log;

    public DefaultTaskExecutor(AppLogger log) {
        this.log = log;
    }

    @Override
    public void execute(ScheduledTask task) throws Exception {
        try {
            // Simulate processing time (remove in production if not needed)
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Task execution interrupted", e);
        }

        // Main requirement: Log the task message with colors
        log.info("\u001B[35m🚀 SCHEDULED TASK EXECUTION: \u001B[32m[{}] \u001B[36m{} \u001B[33m(CRON: {})\u001B[0m", 
                task.getSsuuid(), task.getMessage(), task.getCronExpression());
    }

    @Override
    public String getExecutorType() {
        return "DEFAULT";
    }
}
