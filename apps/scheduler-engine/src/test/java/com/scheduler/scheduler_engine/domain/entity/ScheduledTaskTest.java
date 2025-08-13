package com.scheduler.scheduler_engine.domain.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("ScheduledTask Domain Entity Tests")
class ScheduledTaskTest {

    private ScheduledTask scheduledTask;
    private final String testSsuuid = "test-user-123";
    private final String testMessage = "Test task message";
    private final String testCronExpression = "*/5 * * * * *"; 

    @BeforeEach
    void setUp() {
        scheduledTask = new ScheduledTask(testSsuuid, testMessage, testCronExpression);
    }

    @Nested
    @DisplayName("Constructor and Basic Properties")
    class ConstructorAndBasicProperties {

        @Test
        @DisplayName("Should create task with required parameters")
        void shouldCreateTaskWithRequiredParameters() {
            assertNotNull(scheduledTask);
            assertEquals(testSsuuid, scheduledTask.getSsuuid());
            assertEquals(testMessage, scheduledTask.getMessage());
            assertEquals(testCronExpression, scheduledTask.getCronExpression());
        }

        @Test
        @DisplayName("Should initialize with default values")
        void shouldInitializeWithDefaultValues() {
            assertEquals(0, scheduledTask.getExecutionCount());
            assertEquals(TaskStatus.PENDING, scheduledTask.getStatus());
            assertNull(scheduledTask.getDeletedAt());
            assertNull(scheduledTask.getLastExecutedAt());
            assertNull(scheduledTask.getNextExecutionTime());
        }

        @Test
        @DisplayName("Should create task with no-args constructor")
        void shouldCreateTaskWithNoArgsConstructor() {
            ScheduledTask emptyTask = new ScheduledTask();
            assertNotNull(emptyTask);
            assertEquals(0, emptyTask.getExecutionCount());
            assertEquals(TaskStatus.PENDING, emptyTask.getStatus());
        }
    }

    @Nested
    @DisplayName("Task State Management")
    class TaskStateManagement {

        @Test
        @DisplayName("Should mark task as deleted")
        void shouldMarkTaskAsDeleted() {
            LocalDateTime beforeDeletion = LocalDateTime.now();
            
            scheduledTask.markAsDeleted();
            
            assertNotNull(scheduledTask.getDeletedAt());
            assertTrue(scheduledTask.getDeletedAt().isAfter(beforeDeletion) || 
                      scheduledTask.getDeletedAt().isEqual(beforeDeletion));
            assertEquals(TaskStatus.DELETED, scheduledTask.getStatus());
            assertTrue(scheduledTask.isDeleted());
        }

        @Test
        @DisplayName("Should increment execution count")
        void shouldIncrementExecutionCount() {
            LocalDateTime beforeExecution = LocalDateTime.now();
            int initialCount = scheduledTask.getExecutionCount();
            
            scheduledTask.incrementExecutionCount();
            
            assertEquals(initialCount + 1, scheduledTask.getExecutionCount());
            assertNotNull(scheduledTask.getLastExecutedAt());
            assertTrue(scheduledTask.getLastExecutedAt().isAfter(beforeExecution) || 
                      scheduledTask.getLastExecutedAt().isEqual(beforeExecution));
        }

        @Test
        @DisplayName("Should increment execution count multiple times")
        void shouldIncrementExecutionCountMultipleTimes() {
            scheduledTask.incrementExecutionCount();
            scheduledTask.incrementExecutionCount();
            scheduledTask.incrementExecutionCount();
            
            assertEquals(3, scheduledTask.getExecutionCount());
        }
    }

    @Nested
    @DisplayName("Task Status Checks")
    class TaskStatusChecks {

        @Test
        @DisplayName("Should identify non-deleted task")
        void shouldIdentifyNonDeletedTask() {
            assertFalse(scheduledTask.isDeleted());
        }

        @Test
        @DisplayName("Should identify deleted task")
        void shouldIdentifyDeletedTask() {
            scheduledTask.markAsDeleted();
            assertTrue(scheduledTask.isDeleted());
        }

        @Test
        @DisplayName("Should identify active task")
        void shouldIdentifyActiveTask() {
            assertTrue(scheduledTask.isActive());
        }

        @Test
        @DisplayName("Should not be active when deleted")
        void shouldNotBeActiveWhenDeleted() {
            scheduledTask.markAsDeleted();
            assertFalse(scheduledTask.isActive());
        }

        @Test
        @DisplayName("Should not be active when status is not PENDING")
        void shouldNotBeActiveWhenStatusIsNotPending() {
            scheduledTask.setStatus(TaskStatus.RUNNING);
            assertFalse(scheduledTask.isActive());
            
            scheduledTask.setStatus(TaskStatus.COMPLETED);
            assertFalse(scheduledTask.isActive());
            
            scheduledTask.setStatus(TaskStatus.FAILED);
            assertFalse(scheduledTask.isActive());
        }
    }

    @Nested
    @DisplayName("Next Execution Time Calculation")
    class NextExecutionTimeCalculation {

        @Test
        @DisplayName("Should calculate next execution time with valid cron expression")
        void shouldCalculateNextExecutionTimeWithValidCron() {
            LocalDateTime before = LocalDateTime.now();
            
            scheduledTask.calculateNextExecutionTime();
            
            assertNotNull(scheduledTask.getNextExecutionTime());
            assertTrue(scheduledTask.getNextExecutionTime().isAfter(before));
        }

        @Test
        @DisplayName("Should handle invalid cron expression gracefully")
        void shouldHandleInvalidCronExpressionGracefully() {
            scheduledTask.setCronExpression("invalid-cron");
            LocalDateTime before = LocalDateTime.now();
            
            scheduledTask.calculateNextExecutionTime();
            
            assertNotNull(scheduledTask.getNextExecutionTime());
            // Should fallback to 5 seconds from now
            assertTrue(scheduledTask.getNextExecutionTime().isAfter(before));
            assertTrue(scheduledTask.getNextExecutionTime().isBefore(before.plusSeconds(10)));
        }

        @Test
        @DisplayName("Should handle null cron expression")
        void shouldHandleNullCronExpression() {
            scheduledTask.setCronExpression(null);
            LocalDateTime before = LocalDateTime.now();
            
            scheduledTask.calculateNextExecutionTime();
            
            assertNotNull(scheduledTask.getNextExecutionTime());
            // Should fallback to 5 seconds from now
            assertTrue(scheduledTask.getNextExecutionTime().isAfter(before));
            assertTrue(scheduledTask.getNextExecutionTime().isBefore(before.plusSeconds(10)));
        }

        @Test
        @DisplayName("Should handle empty cron expression")
        void shouldHandleEmptyCronExpression() {
            scheduledTask.setCronExpression("");
            LocalDateTime before = LocalDateTime.now();
            
            scheduledTask.calculateNextExecutionTime();
            
            assertNotNull(scheduledTask.getNextExecutionTime());
            // Should fallback to 5 seconds from now
            assertTrue(scheduledTask.getNextExecutionTime().isAfter(before));
            assertTrue(scheduledTask.getNextExecutionTime().isBefore(before.plusSeconds(10)));
        }
    }

    @Nested
    @DisplayName("PrePersist Lifecycle")
    class PrePersistLifecycle {

        @Test
        @DisplayName("Should set creation time on persist")
        void shouldSetCreationTimeOnPersist() {
            ScheduledTask newTask = new ScheduledTask();
            LocalDateTime before = LocalDateTime.now();
            
            newTask.onCreate();
            
            assertNotNull(newTask.getCreatedAt());
            assertTrue(newTask.getCreatedAt().isAfter(before) || 
                      newTask.getCreatedAt().isEqual(before));
        }

        @Test
        @DisplayName("Should set default status on persist")
        void shouldSetDefaultStatusOnPersist() {
            ScheduledTask newTask = new ScheduledTask();
            newTask.setStatus(null);
            
            newTask.onCreate();
            
            assertEquals(TaskStatus.PENDING, newTask.getStatus());
        }

        @Test
        @DisplayName("Should set default execution count on persist")
        void shouldSetDefaultExecutionCountOnPersist() {
            ScheduledTask newTask = new ScheduledTask();
            newTask.setExecutionCount(null);
            
            newTask.onCreate();
            
            assertEquals(0, newTask.getExecutionCount());
        }

        @Test
        @DisplayName("Should not override existing creation time")
        void shouldNotOverrideExistingCreationTime() {
            LocalDateTime existingTime = LocalDateTime.now().minusHours(1);
            scheduledTask.setCreatedAt(existingTime);
            
            scheduledTask.onCreate();
            
            assertEquals(existingTime, scheduledTask.getCreatedAt());
        }
    }

    @Nested
    @DisplayName("ToString Method")
    class ToStringMethod {

        @Test
        @DisplayName("Should return meaningful string representation")
        void shouldReturnMeaningfulStringRepresentation() {
            scheduledTask.setId(UUID.randomUUID());
            
            String result = scheduledTask.toString();
            
            assertNotNull(result);
            assertTrue(result.contains("ScheduledTask"));
            assertTrue(result.contains(scheduledTask.getId().toString()));
            assertTrue(result.contains(testSsuuid));
            assertTrue(result.contains(testMessage));
            assertTrue(result.contains("PENDING"));
            assertTrue(result.contains("0"));
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {

        @Test
        @DisplayName("Should handle multiple operations on same task")
        void shouldHandleMultipleOperationsOnSameTask() {
            scheduledTask.incrementExecutionCount();
            scheduledTask.calculateNextExecutionTime();
            scheduledTask.setStatus(TaskStatus.RUNNING);
            
            assertEquals(1, scheduledTask.getExecutionCount());
            assertNotNull(scheduledTask.getNextExecutionTime());
            assertEquals(TaskStatus.RUNNING, scheduledTask.getStatus());
            assertFalse(scheduledTask.isActive()); 
            
            scheduledTask.markAsDeleted();
            assertTrue(scheduledTask.isDeleted());
            assertEquals(TaskStatus.DELETED, scheduledTask.getStatus());
        }

        @Test
        @DisplayName("Should handle task with very long message")
        void shouldHandleTaskWithVeryLongMessage() {
            String longMessage = "A".repeat(1000);
            ScheduledTask taskWithLongMessage = new ScheduledTask(testSsuuid, longMessage, testCronExpression);
            
            assertEquals(longMessage, taskWithLongMessage.getMessage());
            assertEquals(1000, taskWithLongMessage.getMessage().length());
        }
    }
}
