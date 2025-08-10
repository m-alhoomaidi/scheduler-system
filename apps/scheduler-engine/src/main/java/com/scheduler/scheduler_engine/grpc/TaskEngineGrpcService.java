package com.scheduler.scheduler_engine.grpc;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.domain.repository.ScheduledTaskRepository;
import com.scheduler.scheduler_engine.proto.v1.*;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
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
            if (request.getSsuuid().isBlank() || request.getMessage().isBlank() || request.getIdempotencyKey().isBlank()) {
                responseObserver.onError(
                        Status.INVALID_ARGUMENT.withDescription("ssuuid, message and idempotencyKey are required and must be non-blank").asRuntimeException()
                );
                return;
            }

            log.info("RegisterTask: ssuuid={}, idempotencyKey={}", request.getSsuuid(), request.getIdempotencyKey());

            Optional<ScheduledTask> existing = scheduledTaskRepository
                    .findBySsuuidAndIdempotencyKeyAndDeletedAtIsNull(request.getSsuuid(), request.getIdempotencyKey());

            if (existing.isPresent()) {
                String taskId = existing.get().getId().toString();
                log.info("RegisterTask idempotent hit: taskId={}", taskId);
                respond(responseObserver, RegisterTaskResponse.newBuilder().setTaskId(taskId).build());
                return;
            }

            ScheduledTask toSave = new ScheduledTask(
                    request.getSsuuid(),
                    request.getMessage(),
                    request.getIdempotencyKey()
            );

            try {
                ScheduledTask saved = scheduledTaskRepository.save(toSave);
                log.info("RegisterTask created: taskId={}", saved.getId());
                respond(responseObserver, RegisterTaskResponse.newBuilder().setTaskId(saved.getId().toString()).build());
            } catch (DataIntegrityViolationException dup) {
                ScheduledTask winner = scheduledTaskRepository
                        .findBySsuuidAndIdempotencyKeyAndDeletedAtIsNull(request.getSsuuid(), request.getIdempotencyKey())
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
}
