package com.scheduler.scheduler_engine.service;

import com.scheduler.scheduler_engine.domain.entity.TaskStatus;
import com.scheduler.scheduler_engine.domain.repository.ScheduledTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

/**
 * Health monitoring for scheduler system
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulerHealthService {

    private final ScheduledTaskRepository repository;

    public Map<String, Object> getHealthStatus() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            long totalTasks = repository.countByDeletedAtIsNull();
            long pendingTasks = repository.countByStatusAndDeletedAtIsNull(TaskStatus.PENDING);
            long runningTasks = repository.countByStatusAndDeletedAtIsNull(TaskStatus.RUNNING);
            
            health.put("status", "UP");
            health.put("totalTasks", totalTasks);
            health.put("pendingTasks", pendingTasks);
            health.put("runningTasks", runningTasks);
            health.put("lastCheck", LocalDateTime.now());

            // Warning if too many running tasks (might be stuck)
            if (runningTasks > 10) {
                health.put("status", "WARN");
                health.put("warning", "High number of running tasks: " + runningTasks);
            }
            
        } catch (Exception e) {
            log.error("Health check failed", e);
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
        }
        
        return health;
    }
}
