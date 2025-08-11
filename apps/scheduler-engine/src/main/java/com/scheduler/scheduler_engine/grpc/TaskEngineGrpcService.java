package com.scheduler.scheduler_engine.grpc;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.domain.repository.ScheduledTaskRepository;
import com.scheduler.scheduler_engine.proto.v1.*;
import com.scheduler.scheduler_engine.domain.entity.TaskStatus;
import com.google.protobuf.Timestamp;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class TaskEngineGrpcService extends TaskEngineGrpc.TaskEngineImplBase {

    private final ScheduledTaskRepository scheduledTaskRepository;

    
    @Override
    @Transactional
    public void registerTask(RegisterTaskRequest request, StreamObserver<RegisterTaskResponse> responseObserver) {
        try {
            if (request.getSsuuid().isBlank() || request.getMessage().isBlank()) {
                responseObserver.onError(
                        Status.INVALID_ARGUMENT.withDescription("ssuuid and message are required and must be non-blank").asRuntimeException()
                );
                return;
            }

            log.info("RegisterTask: ssuuid={}", request.getSsuuid());

            Optional<ScheduledTask> existing = scheduledTaskRepository
                    .findBySsuuidAndDeletedAtIsNull(request.getSsuuid());

            if (existing.isPresent()) {
                String taskId = existing.get().getId().toString();
                log.info("RegisterTask idempotent hit: taskId={}", taskId);
                respond(responseObserver, RegisterTaskResponse.newBuilder().setTaskId(taskId).build());
                return;
            }

            ScheduledTask toSave = new ScheduledTask(
                    request.getSsuuid(),
                    request.getMessage()
            );

            try {
                ScheduledTask saved = scheduledTaskRepository.save(toSave);
                log.info("RegisterTask created: taskId={}", saved.getId());
                respond(responseObserver, RegisterTaskResponse.newBuilder().setTaskId(saved.getId().toString()).build());
            } catch (DataIntegrityViolationException dup) {
                ScheduledTask winner = scheduledTaskRepository
                            .findBySsuuidAndDeletedAtIsNull(request.getSsuuid())
                        .orElseThrow(() -> dup); // should exist now
                log.info("RegisterTask concurrent idempotent hit: taskId={}", winner.getId());
                respond(responseObserver, RegisterTaskResponse.newBuilder().setTaskId(winner.getId().toString()).build());
            }

        } catch (Exception e) {
            log.error("RegisterTask error: ssuuid={}, error={}", request.getSsuuid(), e.getMessage(), e);
            responseObserver.onError(Status.INTERNAL.withDescription("Failed to register task").withCause(e).asRuntimeException());
        }
    }

    
    @Override
    @Transactional
    public void deleteTask(DeleteTaskRequest request, StreamObserver<DeleteTaskResponse> responseObserver) {
        try {
            String rawId = request.getTaskId();
            if (rawId.isBlank()) {
                responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("taskId is required").asRuntimeException());
                return;
            }

            UUID taskId;
            try {
                taskId = UUID.fromString(rawId);
            } catch (IllegalArgumentException ex) {
                responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("Invalid taskId format (UUID expected)").asRuntimeException());
                return;
            }

            var taskOpt = scheduledTaskRepository.findById(taskId);

            if (taskOpt.isEmpty()) {
                log.warn("DeleteTask: not found or already deleted: taskId={}", rawId);
                respond(responseObserver, DeleteTaskResponse.newBuilder().setDeleted(false).build());
                return;
            }

            var task = taskOpt.get();
            task.markAsDeleted();
            scheduledTaskRepository.save(task);

            log.info("DeleteTask: soft-deleted taskId={}", rawId);
            respond(responseObserver, DeleteTaskResponse.newBuilder().setDeleted(true).build());

        } catch (Exception e) {
            log.error("DeleteTask error: taskId={}, error={}", request.getTaskId(), e.getMessage(), e);
            responseObserver.onError(Status.INTERNAL.withDescription("Failed to delete task").withCause(e).asRuntimeException());
        }
    }

    
    @Override
    public void ping(PingRequest request, StreamObserver<PingResponse> responseObserver) {
        try {
            respond(responseObserver, PingResponse.newBuilder().setStatus("pong").build());
        } catch (Exception e) {
            log.error("Ping error: {}", e.getMessage(), e);
            responseObserver.onError(Status.INTERNAL.withDescription("Failed to handle ping").withCause(e).asRuntimeException());
        }
    }

   
    private static <T> void respond(StreamObserver<T> obs, T msg) {
        obs.onNext(msg);
        obs.onCompleted();
    }

    @Override
    @Transactional(readOnly = true)
    public void listTasks(ListTasksRequest request, StreamObserver<ListTasksResponse> responseObserver) {
        try {
            int page = Math.max(0, request.getPage());
            int size = request.getPageSize() > 0 ? request.getPageSize() : 20;
            Pageable pageable = PageRequest.of(page, size);

            TaskStatus statusFilter = null;
            if (!request.getStatus().isBlank()) {
                try {
                    statusFilter = TaskStatus.valueOf(request.getStatus());
                } catch (IllegalArgumentException e) {
                    responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("Invalid status filter").asRuntimeException());
                    return;
                }
            }

            String ssuuidFilter = request.getSsuuid().isBlank() ? null : request.getSsuuid();

            var pageResult = scheduledTaskRepository.findAllPaginated(ssuuidFilter, statusFilter, pageable);

            ListTasksResponse.Builder resp = ListTasksResponse.newBuilder()
                    .setTotal(pageResult.getTotalElements())
                    .setPage(page)
                    .setPageSize(size)
                    .setHasNext(pageResult.hasNext());

            for (ScheduledTask t : pageResult.getContent()) {
                resp.addTasks(TaskItem.newBuilder()
                        .setId(t.getId().toString())
                        .setSsuuid(t.getSsuuid())
                        .setMessage(t.getMessage())
                        .setStatus(t.getStatus().name())
                        .setExecutionCount(t.getExecutionCount())
                        .setCreatedAt(toTs(t.getCreatedAt()))
                        .setUpdatedAt(toTs(t.getUpdatedAt()))
                        .setLastExecutedAt(toTs(t.getLastExecutedAt()))
                        .build());
            }

            respond(responseObserver, resp.build());
        } catch (Exception e) {
            log.error("ListTasks error: {}", e.getMessage(), e);
            responseObserver.onError(Status.INTERNAL.withDescription("Failed to list tasks").withCause(e).asRuntimeException());
        }
    }

    private static Timestamp toTs(java.time.LocalDateTime time) {
        if (time == null) return Timestamp.getDefaultInstance();
        java.time.Instant instant = time.atZone(java.time.ZoneId.systemDefault()).toInstant();
        return Timestamp.newBuilder().setSeconds(instant.getEpochSecond()).setNanos(instant.getNano()).build();
    }
}
