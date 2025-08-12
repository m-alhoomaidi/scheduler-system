package com.scheduler.scheduler_engine.service;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.logger.AppLogger;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;


@Service
public class TaskRetryService {

    private final AppLogger log;

    public TaskRetryService( AppLogger log) {
        this.log = log;
    }

    public boolean shouldRetry(ScheduledTask task, Exception error) {
      
        //TODO: Future implementatoin for the failure tasks
        return true;
    }

    public void scheduleRetry(ScheduledTask task, Exception error) {
        // Calculate next execution with exponential backoff for errors
        LocalDateTime baseNextExecution = calculateBaseNextExecution(task);
        
        // Add jitter to prevent thundering herd
        long jitterMs = ThreadLocalRandom.current().nextLong(0, 1000);
        LocalDateTime nextExecution = baseNextExecution.plusNanos(jitterMs * 1_000_000);
        
        task.setNextExecutionTime(nextExecution);
        
        log.warn("Task execution failed, rescheduled: taskId={}, error={}, nextExecution={}", 
                task.getId(), error.getMessage(), nextExecution);
    }

    private LocalDateTime calculateBaseNextExecution(ScheduledTask task) {
        try {
            task.calculateNextExecutionTime();
            return task.getNextExecutionTime();
        } catch (Exception e) {
            // Fallback: schedule for 5 seconds from now
            log.warn("Failed to calculate next execution time, using fallback: taskId={}", task.getId());
            return LocalDateTime.now().plusSeconds(5);
        }
    }

    public boolean isTransientError(Exception error) {
        // Classify errors - transient errors should be retried
        return error instanceof java.sql.SQLException ||
               error instanceof org.springframework.dao.TransientDataAccessException ||
               error instanceof java.util.concurrent.TimeoutException;
    }
}

