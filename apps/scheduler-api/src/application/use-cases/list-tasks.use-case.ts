import { Injectable } from '@nestjs/common';
import { ScheduledTaskQueueRepositoryPort } from '@/domain/ports';

@Injectable()
export class ListTasksUseCase {
  constructor(private readonly queueRepo: ScheduledTaskQueueRepositoryPort) {}

  async execute(input: { ssuuid: string; page?: number; limit?: number }) {
    return this.queueRepo.findBySSUUID(input.ssuuid, {
      page: input.page,
      limit: input.limit,
    });
  }
}
