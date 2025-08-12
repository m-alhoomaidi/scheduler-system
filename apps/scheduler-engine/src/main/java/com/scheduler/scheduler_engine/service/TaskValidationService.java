package com.scheduler.scheduler_engine.service;
import com.scheduler.scheduler_engine.config.SchedulerConfig;
import com.scheduler.scheduler_engine.domain.repository.ScheduledTaskRepository;
import com.scheduler.scheduler_engine.logger.AppLogger;
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class TaskValidationService {

    private final SchedulerConfig config;
    private final AppLogger log;

    public TaskValidationService(SchedulerConfig config, ScheduledTaskRepository repository, AppLogger log) {
        this.config = config;
        this.log = log;
    }

    // Security patterns
    private static final Pattern SAFE_STRING_PATTERN = Pattern.compile("^[a-zA-Z0-9\\s\\-_.,!?@#$%^&*()+={}\\[\\]:;\"'<>/\\\\|`~]*$");
    private static final Pattern SSUUID_PATTERN = Pattern.compile("^[a-zA-Z0-9\\-_]{1,50}$");

    public void validateTaskCreation(String ssuuid, String message) {
        if (!config.getSecurity().isEnableInputValidation()) {
            return;
        }

        validateSsuuid(ssuuid);
        validateMessage(message, ssuuid);
        
    }

    private void validateSsuuid(String ssuuid) {
        if (ssuuid == null || ssuuid.trim().isEmpty()) {
            throw new SecurityException("SSUUID cannot be null or empty");
        }

        if (ssuuid.length() > 50) {
            throw new SecurityException("SSUUID too long (max 50 characters)");
        }

        if (!SSUUID_PATTERN.matcher(ssuuid).matches()) {
            throw new SecurityException("SSUUID contains invalid characters (only alphanumeric, -, _ allowed)");
        }
    }

    private void validateMessage(String message, String ssuuid) {
        if (message == null || message.trim().isEmpty()) {
            throw new SecurityException("Message cannot be null or empty");
        }

        int maxLength = config.getSecurity().getMaxMessageLength();
        if (message.length() > maxLength) {
            throw new SecurityException("Message too long (max " + maxLength + " characters)");
        }

        if (!SAFE_STRING_PATTERN.matcher(message).matches()) {
            log.warn("Message contains potentially unsafe characters for ssuuid: {}", ssuuid);
            throw new SecurityException("Message contains invalid or potentially unsafe characters");
        }
    }



    public void auditTaskOperation(String operation, String ssuuid, String details) {
        if (config.getSecurity().isEnableAuditLogging()) {
            log.info("AUDIT: operation={}, ssuuid={}, details={}", operation, ssuuid, details);
        }
    }
}
