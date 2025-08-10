import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { TaskEnginePort } from '@/domain/ports/task-engine.port';

@Injectable()
export class DeleteTaskUseCase {
  constructor(private readonly taskEngine: TaskEnginePort) {}

  async execute(input: { taskId: string }) {
    try {
      await this.taskEngine.ping();
    } catch {
      throw new ServiceUnavailableException('Task engine is unavailable');
    }
    await this.taskEngine.deleteTask(input.taskId);
  }
}


