import { ListApiLogsUseCase } from './list-api-logs.use-case';
import { ApiLogRepositoryPort } from '@/domain/ports/api-log.repository.port';

describe('ListApiLogsUseCase', () => {
  const repo: jest.Mocked<ApiLogRepositoryPort> = {
    findPaginated: jest.fn(),
    create: jest.fn() as any,
  } as any;

  beforeEach(() => jest.resetAllMocks());

  it('returns paginated logs with defaults', async () => {
    repo.findPaginated.mockResolvedValueOnce({ data: [], total: 0 });
    const uc = new ListApiLogsUseCase(repo);
    const res = await uc.execute({});
    expect(repo.findPaginated).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res).toEqual({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('passes page and limit', async () => {
    repo.findPaginated.mockResolvedValueOnce({ data: [{ id: 'a1' } as any], total: 1 });
    const uc = new ListApiLogsUseCase(repo);
    const res = await uc.execute({ page: 3, limit: 50 });
    expect(repo.findPaginated).toHaveBeenCalledWith({ page: 3, limit: 50 });
    expect(res.page).toBe(3);
    expect(res.limit).toBe(50);
    expect(res.total).toBe(1);
  });
});



