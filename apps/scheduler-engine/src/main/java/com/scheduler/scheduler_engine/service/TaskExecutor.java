package com.scheduler.scheduler_engine.service;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;

/**
 * Strategy interface for task execution.
 * Allows different execution strategies without changing core logic.
 */
public interface TaskExecutor {
    
    /**
     * Execute a single task
     * @param task the task to execute
     * @throws Exception if execution fails
     */
    void execute(ScheduledTask task) throws Exception;
    
    /**
     * Get executor type for logging/monitoring
     */
    String getExecutorType();
}
