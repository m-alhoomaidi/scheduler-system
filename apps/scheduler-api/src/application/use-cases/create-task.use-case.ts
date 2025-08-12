import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ScheduledTaskQueueRepositoryPort } from '@/domain/ports';
import { TaskEnginePort } from '@/domain/ports/task-engine.port';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly queueRepo: ScheduledTaskQueueRepositoryPort,
    private readonly taskEngine: TaskEnginePort,
  ) {}

  async execute(input: { ssuuid: string; message: string }) {
    // health check first
    try {
      await this.taskEngine.ping();
    } catch {
      throw new ServiceUnavailableException('Task engine is unavailable');
    }

    const grpc = await this.taskEngine.registerTask({
      ssuuid: input.ssuuid,
      message: input.message,
    });

    const saved = await this.queueRepo.enqueue({
      ssuuid: input.ssuuid,
      message: input.message,
    });

    return { id: grpc.taskId || saved.id };
  }

  async pingEngine() {
    return this.taskEngine.ping();
  }
}
