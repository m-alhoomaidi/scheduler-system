package com.scheduler.scheduler_engine.domain.repository;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.domain.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduledTaskRepository extends JpaRepository<ScheduledTask, UUID> {

    
    Optional<ScheduledTask> findBySsuuidAndDeletedAtIsNull(
            String ssuuid);

   
    List<ScheduledTask> findBySsuuidAndDeletedAtIsNullOrderByCreatedAtDesc(String ssuuid);

   
    @Query("SELECT t FROM ScheduledTask t WHERE t.status = 'PENDING' AND t.deletedAt IS NULL AND t.nextExecutionTime <= :now ORDER BY t.nextExecutionTime ASC")
    List<ScheduledTask> findPendingTasksForExecution(@Param("now") java.time.LocalDateTime now);

    
    List<ScheduledTask> findByStatusAndDeletedAtIsNull(TaskStatus status);

    long countByStatusAndDeletedAtIsNull(TaskStatus status);

    // Count all active tasks
    long countByDeletedAtIsNull();

   
    boolean existsBySsuuidAndDeletedAtIsNull(String ssuuid);

   
    long countBySsuuidAndDeletedAtIsNull(String ssuuid);

    @Query("SELECT t FROM ScheduledTask t WHERE t.createdAt >= :since AND t.deletedAt IS NULL")
    List<ScheduledTask> findTasksCreatedSince(@Param("since") java.time.LocalDateTime since);

   
    @Query("SELECT t FROM ScheduledTask t WHERE t.status = 'PENDING' AND t.deletedAt IS NULL AND t.createdAt < :threshold")
    List<ScheduledTask> findStaleTasks(@Param("threshold") java.time.LocalDateTime threshold);

    // Pagination queries
    @Query("SELECT t FROM ScheduledTask t WHERE (:ssuuid IS NULL OR t.ssuuid = :ssuuid) AND (:status IS NULL OR t.status = :status) AND t.deletedAt IS NULL ORDER BY t.createdAt DESC")
    Page<ScheduledTask> findAllPaginated(@Param("ssuuid") String ssuuid,
                                         @Param("status") TaskStatus status,
                                         Pageable pageable);
}
