package com.scheduler.scheduler_engine.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.SQLRestriction;


import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "scheduled_tasks", indexes = {
    @Index(name = "idx_ssuuid", columnList = "ssuuid"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_deleted_at", columnList = "deleted_at")
})
@SQLRestriction("deleted_at IS NULL")
public class ScheduledTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(name = "ssuuid", nullable = false)
    private String ssuuid;

    @NotBlank
    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @NotBlank
    @Column(name = "cron_expression", nullable = false)
    private String cronExpression;

    @Column(name = "next_execution_time")
    private LocalDateTime nextExecutionTime;


    @NotNull
    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "execution_count", nullable = false)
    private Integer executionCount = 0;

    @Column(name = "last_executed_at")
    private LocalDateTime lastExecutedAt;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.PENDING;

    // Constructors
    public ScheduledTask() {}

    public ScheduledTask(String ssuuid, String message, String cronExpression) {
        this.ssuuid = ssuuid;
        this.message = message;
        this.cronExpression = cronExpression;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getSsuuid() {
        return ssuuid;
    }

    public void setSsuuid(String ssuuid) {
        this.ssuuid = ssuuid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCronExpression() {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }

    public LocalDateTime getNextExecutionTime() {
        return nextExecutionTime;
    }

    public void setNextExecutionTime(LocalDateTime nextExecutionTime) {
        this.nextExecutionTime = nextExecutionTime;
    }



    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Integer getExecutionCount() {
        return executionCount;
    }

    public void setExecutionCount(Integer executionCount) {
        this.executionCount = executionCount;
    }

    public LocalDateTime getLastExecutedAt() {
        return lastExecutedAt;
    }

    public void setLastExecutedAt(LocalDateTime lastExecutedAt) {
        this.lastExecutedAt = lastExecutedAt;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    // Business Methods
    public void markAsDeleted() {
        this.deletedAt = LocalDateTime.now();
        this.status = TaskStatus.DELETED;
    }

    public void incrementExecutionCount() {
        this.executionCount++;
        this.lastExecutedAt = LocalDateTime.now();
        // Keep status transitions controlled by the service; entity stays simple.
    }

    public void calculateNextExecutionTime() {
        if (this.cronExpression != null && !this.cronExpression.isBlank()) {
            try {
                com.scheduler.scheduler_engine.scheduling.CronExpression cron = 
                    com.scheduler.scheduler_engine.scheduling.CronExpression.parse(this.cronExpression);
                java.time.ZonedDateTime next = cron.nextExecutionAfter(java.time.ZonedDateTime.now());
                this.nextExecutionTime = next.toLocalDateTime();
            } catch (Exception e) {
                // Fallback: schedule for 5 seconds from now if CRON parsing fails
                this.nextExecutionTime = LocalDateTime.now().plusSeconds(5);
            }
        } else {
            // Default: schedule for 5 seconds from now
            this.nextExecutionTime = LocalDateTime.now().plusSeconds(5);
        }
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    public boolean isActive() {
        return !isDeleted() && this.status == TaskStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }

        if (this.status == null) {
            this.status = TaskStatus.PENDING;
        }
        if (this.executionCount == null) {
            this.executionCount = 0;
        }
    }

    @Override
    public String toString() {
        return "ScheduledTask{" +
                "id=" + id +
                ", ssuuid='" + ssuuid + '\'' +
                ", message='" + message + '\'' +
                ", status=" + status +
                ", executionCount=" + executionCount +
                '}';
    }
}
