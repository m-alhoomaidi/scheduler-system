package com.scheduler.scheduler_engine.service;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Default implementation of TaskExecutor.
 * Handles the core task execution logic with proper logging.
 */
@Component
@Slf4j
public class DefaultTaskExecutor implements TaskExecutor {

    @Override
    public void execute(ScheduledTask task) throws Exception {
        try {
            // Simulate processing time (remove in production if not needed)
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Task execution interrupted", e);
        }

        // Main requirement: Log the task message
        log.info("🚀 SCHEDULED TASK EXECUTION: [{}] {} (every 5 seconds)", 
                task.getSsuuid(), task.getMessage());
    }

    @Override
    public String getExecutorType() {
        return "DEFAULT";
    }
}
