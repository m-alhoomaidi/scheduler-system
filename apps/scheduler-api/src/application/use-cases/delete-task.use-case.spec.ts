import { DeleteTaskUseCase } from './delete-task.use-case';
import { TaskEnginePort } from '@/domain/ports/task-engine.port';
import { ServiceUnavailableException } from '@nestjs/common';

describe('DeleteTaskUseCase', () => {
  const engine: jest.Mocked<TaskEnginePort> = {
    ping: jest.fn(),
    registerTask: jest.fn(),
    deleteTask: jest.fn(),
  } as any;

  beforeEach(() => jest.resetAllMocks());

  it('throws when engine is unavailable', async () => {
    engine.ping.mockRejectedValueOnce(new Error('down'));
    const uc = new DeleteTaskUseCase(engine);
    await expect(uc.execute({ taskId: 't1' })).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(engine.deleteTask).not.toHaveBeenCalled();
  });

  it('pings then deletes when available', async () => {
    engine.ping.mockResolvedValueOnce({ message: 'pong' });
    engine.deleteTask.mockResolvedValueOnce({ ok: true });
    const uc = new DeleteTaskUseCase(engine);
    await uc.execute({ taskId: 't1' });
    expect(engine.ping).toHaveBeenCalled();
    expect(engine.deleteTask).toHaveBeenCalledWith('t1');
  });
});



