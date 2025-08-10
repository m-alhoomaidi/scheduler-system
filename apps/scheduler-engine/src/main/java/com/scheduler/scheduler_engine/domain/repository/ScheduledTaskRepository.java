package com.scheduler.scheduler_engine.domain.repository;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.domain.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduledTaskRepository extends JpaRepository<ScheduledTask, UUID> {

    
    Optional<ScheduledTask> findBySsuuidAndIdempotencyKeyAndDeletedAtIsNull(
            String ssuuid, String idempotencyKey);

   
    List<ScheduledTask> findBySsuuidAndDeletedAtIsNullOrderByCreatedAtDesc(String ssuuid);

   
    @Query("SELECT t FROM ScheduledTask t WHERE t.status = 'PENDING' AND t.deletedAt IS NULL ORDER BY t.createdAt ASC")
    List<ScheduledTask> findPendingTasksForExecution();

    
    List<ScheduledTask> findByStatusAndDeletedAtIsNull(TaskStatus status);

    long countByStatusAndDeletedAtIsNull(TaskStatus status);

   
    boolean existsBySsuuidAndIdempotencyKeyAndDeletedAtIsNull(String ssuuid, String idempotencyKey);

   
    long countBySsuuidAndDeletedAtIsNull(String ssuuid);

    @Query("SELECT t FROM ScheduledTask t WHERE t.createdAt >= :since AND t.deletedAt IS NULL")
    List<ScheduledTask> findTasksCreatedSince(@Param("since") java.time.LocalDateTime since);

   
    @Query("SELECT t FROM ScheduledTask t WHERE t.status = 'PENDING' AND t.deletedAt IS NULL AND t.createdAt < :threshold")
    List<ScheduledTask> findStaleTasks(@Param("threshold") java.time.LocalDateTime threshold);
}
