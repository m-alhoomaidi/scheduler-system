package com.scheduler.scheduler_engine.domain.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("TaskStatus Enum Tests")
class TaskStatusTest {

    @Test
    @DisplayName("Should have all expected status values")
    void shouldHaveAllExpectedStatusValues() {
        TaskStatus[] statuses = TaskStatus.values();
        
        assertEquals(5, statuses.length);
        assertTrue(containsStatus(statuses, TaskStatus.PENDING));
        assertTrue(containsStatus(statuses, TaskStatus.RUNNING));
        assertTrue(containsStatus(statuses, TaskStatus.COMPLETED));
        assertTrue(containsStatus(statuses, TaskStatus.FAILED));
        assertTrue(containsStatus(statuses, TaskStatus.DELETED));
    }

    @ParameterizedTest
    @EnumSource(TaskStatus.class)
    @DisplayName("Should convert to string properly")
    void shouldConvertToStringProperly(TaskStatus status) {
        String stringValue = status.toString();
        
        assertNotNull(stringValue);
        assertFalse(stringValue.isEmpty());
        assertEquals(status.name(), stringValue);
    }

    @Test
    @DisplayName("Should support valueOf operation")
    void shouldSupportValueOfOperation() {
        assertEquals(TaskStatus.PENDING, TaskStatus.valueOf("PENDING"));
        assertEquals(TaskStatus.RUNNING, TaskStatus.valueOf("RUNNING"));
        assertEquals(TaskStatus.COMPLETED, TaskStatus.valueOf("COMPLETED"));
        assertEquals(TaskStatus.FAILED, TaskStatus.valueOf("FAILED"));
        assertEquals(TaskStatus.DELETED, TaskStatus.valueOf("DELETED"));
    }

    @Test
    @DisplayName("Should throw exception for invalid valueOf")
    void shouldThrowExceptionForInvalidValueOf() {
        assertThrows(IllegalArgumentException.class, () -> {
            TaskStatus.valueOf("INVALID_STATUS");
        });
    }

    @Test
    @DisplayName("Should have proper ordinal values")
    void shouldHaveProperOrdinalValues() {
        assertEquals(0, TaskStatus.PENDING.ordinal());
        assertEquals(1, TaskStatus.RUNNING.ordinal());
        assertEquals(2, TaskStatus.COMPLETED.ordinal());
        assertEquals(3, TaskStatus.FAILED.ordinal());
        assertEquals(4, TaskStatus.DELETED.ordinal());
    }

    @Test
    @DisplayName("Should support equality comparison")
    void shouldSupportEqualityComparison() {
        TaskStatus status1 = TaskStatus.PENDING;
        TaskStatus status2 = TaskStatus.PENDING;
        TaskStatus status3 = TaskStatus.RUNNING;

        assertEquals(status1, status2);
        assertNotEquals(status1, status3);
        assertTrue(status1 == status2); // Same enum instance
        assertFalse(status1 == status3); // Different enum instances
    }

    @Test
    @DisplayName("Should be usable in switch statements")
    void shouldBeUsableInSwitchStatements() {
        String result = getStatusDescription(TaskStatus.PENDING);
        assertEquals("Task is waiting to be executed", result);

        result = getStatusDescription(TaskStatus.RUNNING);
        assertEquals("Task is currently being executed", result);

        result = getStatusDescription(TaskStatus.COMPLETED);
        assertEquals("Task has been completed successfully", result);

        result = getStatusDescription(TaskStatus.FAILED);
        assertEquals("Task execution failed", result);

        result = getStatusDescription(TaskStatus.DELETED);
        assertEquals("Task has been soft deleted", result);
    }

    // Helper method to test switch statement usage
    private String getStatusDescription(TaskStatus status) {
        return switch (status) {
            case PENDING -> "Task is waiting to be executed";
            case RUNNING -> "Task is currently being executed";
            case COMPLETED -> "Task has been completed successfully";
            case FAILED -> "Task execution failed";
            case DELETED -> "Task has been soft deleted";
        };
    }

    // Helper method to check if array contains specific status
    private boolean containsStatus(TaskStatus[] statuses, TaskStatus target) {
        for (TaskStatus status : statuses) {
            if (status == target) {
                return true;
            }
        }
        return false;
    }
}
