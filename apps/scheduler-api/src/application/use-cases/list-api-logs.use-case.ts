import { Injectable } from '@nestjs/common';
import { ApiLogRepositoryPort } from '@/domain/ports/api-log.repository.port';

@Injectable()
export class ListApiLogsUseCase {
  constructor(private readonly apiLogRepo: ApiLogRepositoryPort) {}

  async execute(input: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = input;
    const result = await this.apiLogRepo.findPaginated({ page, limit });
    return { ...result, page, limit };
  }
}
