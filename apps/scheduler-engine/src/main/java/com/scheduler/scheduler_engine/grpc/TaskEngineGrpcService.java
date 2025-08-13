package com.scheduler.scheduler_engine.grpc;

import com.scheduler.scheduler_engine.domain.entity.ScheduledTask;
import com.scheduler.scheduler_engine.domain.repository.ScheduledTaskRepository;
import com.scheduler.scheduler_engine.service.TaskValidationService;
import com.scheduler.scheduler_engine.proto.v1.*;
import com.scheduler.scheduler_engine.logger.AppLogger;

import com.scheduler.scheduler_engine.domain.entity.TaskStatus;
import java.time.format.DateTimeFormatter;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;



@GrpcService

public class TaskEngineGrpcService extends TaskEngineGrpc.TaskEngineImplBase {

    private final AppLogger log;
    private final ScheduledTaskRepository scheduledTaskRepository;
    private final TaskValidationService validationService;

    public TaskEngineGrpcService(AppLogger log, ScheduledTaskRepository scheduledTaskRepository, TaskValidationService validationService) {
        this.log = log;
        this.scheduledTaskRepository = scheduledTaskRepository;
        this.validationService = validationService;
    }

   
    @Override
    @Transactional
    public void registerTask(RegisterTaskRequest request, StreamObserver<RegisterTaskResponse> responseObserver) {
        try {
            validationService.validateTaskCreation(request.getSsuuid(), request.getMessage());
            
            String cronExpression = "*/5 * * * * *";

            log.info("RegisterTask: ssuuid={}", request.getSsuuid());
            validationService.auditTaskOperation("REGISTER", request.getSsuuid(), "Task registration attempt");

            ScheduledTask toSave = new ScheduledTask(
                    request.getSsuuid(),
                    request.getMessage(),
                    cronExpression
            );
            
            // Calculate initial execution time
            toSave.calculateNextExecutionTime();

            ScheduledTask saved = scheduledTaskRepository.save(toSave);
            log.info("\u001B[32m✅ RegisterTask created: \u001B[36mtaskId={}\u001B[0m", saved.getId());
            validationService.auditTaskOperation("REGISTER_SUCCESS", request.getSsuuid(), "Task created: " + saved.getId());
            respond(responseObserver, RegisterTaskResponse.newBuilder().setTaskId(saved.getId().toString()).build());

        } catch (SecurityException e) {
            log.warn("RegisterTask security violation: ssuuid={}, error={}", request.getSsuuid(), e.getMessage());
            validationService.auditTaskOperation("REGISTER_SECURITY_VIOLATION", request.getSsuuid(), e.getMessage());
            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription(e.getMessage()).asRuntimeException());
        } catch (Exception e) {
            log.error("RegisterTask error: ssuuid={}, error={}", request.getSsuuid(), e.getMessage(), e);
            validationService.auditTaskOperation("REGISTER_ERROR", request.getSsuuid(), e.getMessage());
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
                        .setCreatedAt(formatDateTime(t.getCreatedAt()))
                        .setUpdatedAt(formatDateTime(t.getUpdatedAt()))
                        .setLastExecutedAt(formatDateTime(t.getLastExecutedAt()))
                        .build());
            }

            respond(responseObserver, resp.build());
        } catch (Exception e) {
            log.error("ListTasks error: {}", e.getMessage(), e);
            responseObserver.onError(Status.INTERNAL.withDescription("Failed to list tasks").withCause(e).asRuntimeException());
        }
    }

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    private static String formatDateTime(java.time.LocalDateTime time) {
        if (time == null) return "";
        return time.format(ISO_FORMATTER);
    }
}
