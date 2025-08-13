package com.scheduler.scheduler_engine.logger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AppLogger {

    private static final String RESET = "\033[0m";
    private static final String RED = "\033[0;31m";
    private static final String GREEN = "\033[0;32m";
    private static final String YELLOW = "\033[0;33m";
    private static final String BLUE = "\033[0;34m";

    private final Logger logger = LoggerFactory.getLogger(AppLogger.class);

    public void info(String message, Object... args) {
        logger.info(GREEN + message + RESET, args);
    }

    public void debug(String message, Object... args) {
        logger.debug(BLUE + message + RESET, args);
    }

    public void warn(String message, Object... args) {
        logger.warn(YELLOW + message + RESET, args);
    }

    public void error(String message, Object... args) {
        logger.error(RED + message + RESET, args);
    }
}
