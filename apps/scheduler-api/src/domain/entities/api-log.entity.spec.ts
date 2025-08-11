import { ApiLog } from './api-log.entity';

describe('ApiLog Entity', () => {
  it('constructs with all fields and preserves readonly identifiers', () => {
    const now = new Date();
    const log = new ApiLog(
      'id-1',
      'ss-1',
      'POST',
      '/v1/tasks',
      202,
      '127.0.0.1',
      'trace-123',
      { body: { a: 1 } },
      { ok: true },
      34,
      now,
      now,
    );

    expect(log.id).toBe('id-1');
    expect(log.ssuuid).toBe('ss-1');
    expect(log.method).toBe('POST');
    expect(log.path).toBe('/v1/tasks');
    expect(log.statusCode).toBe(202);
    expect(log.ip).toBe('127.0.0.1');
    expect(log.traceId).toBe('trace-123');
    expect(log.durationMs).toBe(34);
    expect(log.createdAt).toBe(now);
    expect(log.updatedAt).toBe(now);

    // Mutate allowed fields
    log.method = 'PUT';
    log.statusCode = 204;
    expect(log.method).toBe('PUT');
    expect(log.statusCode).toBe(204);
  });
});


