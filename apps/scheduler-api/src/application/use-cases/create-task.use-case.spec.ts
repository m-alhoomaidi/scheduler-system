import { CreateTaskUseCase } from './create-task.use-case';
import { ScheduledTaskQueueRepositoryPort } from '@/domain/ports/scheduled-task-queue.repository.port';
import { TaskEnginePort } from '@/domain/ports/task-engine.port';
import { ServiceUnavailableException } from '@nestjs/common';

describe('CreateTaskUseCase', () => {
  const queueRepo: jest.Mocked<ScheduledTaskQueueRepositoryPort> = {
    enqueue: jest.fn(),
    markDispatched: jest.fn(),
    findPending: jest.fn(),
    findBySSUUID: jest.fn(),
  } as any;

  const engine: jest.Mocked<TaskEnginePort> = {
    ping: jest.fn(),
    registerTask: jest.fn(),
    deleteTask: jest.fn() as any,
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('throws when engine is down', async () => {
    engine.ping.mockRejectedValueOnce(new Error('down'));
    const useCase = new CreateTaskUseCase(queueRepo, engine);
    await expect(
      useCase.execute({ ssuuid: 'u1', message: 'hi' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('registers and enqueues when new', async () => {
    engine.ping.mockResolvedValueOnce(undefined as any);
    engine.registerTask.mockResolvedValueOnce({ taskId: 'grpc-1' } as any);
    queueRepo.enqueue.mockResolvedValueOnce({ id: 'db-1' } as any);

    const useCase = new CreateTaskUseCase(queueRepo, engine);
    const res = await useCase.execute({ ssuuid: 'u1', message: 'hi' });
    expect(res.id).toBe('grpc-1');
    expect(queueRepo.enqueue).toHaveBeenCalled();
  });

  it('falls back to DB id when grpc does not return taskId', async () => {
    engine.ping.mockResolvedValueOnce(undefined as any);
    engine.registerTask.mockResolvedValueOnce({ taskId: '' } as any);
    queueRepo.enqueue.mockResolvedValueOnce({ id: 'db-xyz' } as any);

    const useCase = new CreateTaskUseCase(queueRepo, engine);
    const res = await useCase.execute({ ssuuid: 'u1', message: 'msg' });
    expect(res.id).toBe('db-xyz');
  });
});
