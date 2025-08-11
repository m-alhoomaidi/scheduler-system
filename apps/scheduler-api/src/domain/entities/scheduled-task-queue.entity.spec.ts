import { ScheduledTaskQueue } from './scheduled-task-queue.entity';

describe('ScheduledTaskQueue Entity', () => {
  it('constructs and allows dispatch state tracking', () => {
    const now = new Date();
    const item = new ScheduledTaskQueue(
      'q1',
      'ss-1',
      'hello',
      null,
      false,
      null,
      now,
      now,
    );

    expect(item.id).toBe('q1');
    expect(item.ssuuid).toBe('ss-1');
    expect(item.message).toBe('hello');
    expect(item.grpcResponse).toBeNull();
    expect(item.isDispatched).toBe(false);
    expect(item.dispatchedAt).toBeNull();
    expect(item.createdAt).toBe(now);
    expect(item.updatedAt).toBe(now);

    // emulate dispatch
    const dispatchedAt = new Date();
    item.isDispatched = true;
    item.dispatchedAt = dispatchedAt;
    item.grpcResponse = { taskId: 't1' } as any;

    expect(item.isDispatched).toBe(true);
    expect(item.dispatchedAt).toBe(dispatchedAt);
    expect(item.grpcResponse).toEqual({ taskId: 't1' });
  });
});


