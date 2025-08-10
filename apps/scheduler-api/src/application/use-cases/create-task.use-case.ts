import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ScheduledTaskQueueRepositoryPort } from '@/domain/ports';
import { TaskEnginePort } from '@/domain/ports/task-engine.port';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly queueRepo: ScheduledTaskQueueRepositoryPort,
    private readonly taskEngine: TaskEnginePort,
  ) {}

  async execute(input: { ssuuid: string; message: string; idempotencyKey?: string }) {
    // health check first
    try {
      await this.taskEngine.ping();
    } catch {
      throw new ServiceUnavailableException('Task engine is unavailable');
    }
    if (input.idempotencyKey) {
      const exists = await this.queueRepo.findByIdempotencyKey(input.ssuuid, input.idempotencyKey);
      if (exists) return { id: exists.id, idempotencyKey: input.idempotencyKey };
    }

    const grpc = await this.taskEngine.registerTask({
      ssuuid: input.ssuuid,
      message: input.message,
      idempotencyKey: input.idempotencyKey,
    });

    const saved = await this.queueRepo.enqueue({
      ssuuid: input.ssuuid,
      message: input.message,
      idempotencyKey: input.idempotencyKey,
    });

    return { id: grpc.taskId || saved.id, idempotencyKey: input.idempotencyKey };
  }

  async pingEngine() {
    return this.taskEngine.ping();
  }
}


