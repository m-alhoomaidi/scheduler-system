package com.scheduler.scheduler_engine.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import java.time.Duration;

@Configuration
@ConfigurationProperties(prefix = "scheduler")
@Data
@Validated
public class SchedulerConfig {

    private TaskConfig task = new TaskConfig();
    private ExecutorConfig executor = new ExecutorConfig();
    private SecurityConfig security = new SecurityConfig();

    @Data
    public static class TaskConfig {
        @NotBlank
        private String defaultCronExpression = "*/5 * * * * *";
        
        @Min(1)
        @Max(100)
        private int maxRetries = 3;
        
        @Min(1)
        private long cleanupIntervalMs = 3600000L; // 1 hour
        
        private boolean cleanupEnabled = true;
        
        @Min(1)
        private int maxConcurrentTasks = 50;
    }

    @Data
    public static class ExecutorConfig {
        @Min(1)
        @Max(100)
        private int threadPoolSize = 10;
        
        @Min(50)
        @Max(5000)
        private long executionIntervalMs = 250L;
        
        @Min(1)
        @Max(60)
        private int shutdownTimeoutSeconds = 10;
    }

    @Data
    public static class SecurityConfig {
        private boolean enableInputValidation = true;
        private boolean enableAuditLogging = true;
        
        @Min(1)
        @Max(10000)
        private int maxMessageLength = 1000;
        
        @Min(1)
        @Max(1000)
        private int maxTasksPerSsuuid = 100;
    }
}
