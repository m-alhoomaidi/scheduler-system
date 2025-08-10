package com.scheduler.scheduler_engine.domain.entity;

public enum TaskStatus {
    PENDING,    // Task is waiting to be executed
    RUNNING,    // Task is currently being executed
    COMPLETED,  // Task has been completed successfully
    FAILED,     // Task execution failed
    DELETED     // Task has been soft deleted
}
