package com.scheduler.scheduler_engine.service;
import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;

public interface TaskExecutor {
    void execute(ScheduledTask task) throws Exception;
    String getExecutorType();
}
