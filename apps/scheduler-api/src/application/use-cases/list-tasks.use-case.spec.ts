import { ListTasksUseCase } from './list-tasks.use-case';
import { ScheduledTaskQueueRepositoryPort } from '@/domain/ports';

describe('ListTasksUseCase', () => {
  const repo: jest.Mocked<ScheduledTaskQueueRepositoryPort> = {
    enqueue: jest.fn(),
    markDispatched: jest.fn(),
    findPending: jest.fn(),
    findBySSUUID: jest.fn(),
  } as any;

  beforeEach(() => jest.resetAllMocks());

  it('delegates to repository with defaults', async () => {
    repo.findBySSUUID.mockResolvedValueOnce({ data: [], total: 0 });
    const uc = new ListTasksUseCase(repo);
    const res = await uc.execute({ ssuuid: 'ss-1' });
    expect(repo.findBySSUUID).toHaveBeenCalledWith('ss-1', { page: undefined, limit: undefined });
    expect(res).toEqual({ data: [], total: 0 });
  });

  it('passes page and limit to repository', async () => {
    repo.findBySSUUID.mockResolvedValueOnce({ data: [{ id: '1' } as any], total: 1 });
    const uc = new ListTasksUseCase(repo);
    const res = await uc.execute({ ssuuid: 'ss-2', page: 2, limit: 5 });
    expect(repo.findBySSUUID).toHaveBeenCalledWith('ss-2', { page: 2, limit: 5 });
    expect(res.total).toBe(1);
  });
});



