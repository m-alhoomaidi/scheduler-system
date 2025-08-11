import { ApiLogRepository } from './api-log.repository';

describe('ApiLogRepository (unit)', () => {
  const now = new Date();

  function createModelMock() {
    const savedDoc = {
      id: '1',
      ssuuid: 'u1',
      method: 'GET',
      path: '/ping',
      statusCode: 200,
      ip: '127.0.0.1',
      traceId: 't-1',
      request: { a: 1 },
      response: { ok: true },
      durationMs: 12,
      createdAt: now,
      updatedAt: now,
    };

    const createdInstance = { save: jest.fn().mockResolvedValue(savedDoc) };

    const findCursor: any = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([savedDoc]),
    };

    const model: any = {
      // constructor behavior: new Model(entry)
      // We simulate by making it callable with `new` via jest.fn() returning createdInstance
    };

    const ModelCtor: any = jest.fn().mockImplementation(() => createdInstance);
    (ModelCtor as any).find = jest.fn().mockReturnValue(findCursor);
    (ModelCtor as any).countDocuments = jest.fn().mockResolvedValue(1);

    return { ModelCtor, createdInstance, savedDoc, findCursor };
  }

  it('log() creates and returns domain entity', async () => {
    const { ModelCtor, savedDoc } = createModelMock();
    const repo = new ApiLogRepository(ModelCtor as any);

    const res = await repo.log({
      ssuuid: 'u1',
      method: 'GET',
      path: '/ping',
      statusCode: 200,
      ip: '127.0.0.1',
      traceId: 't-1',
      request: { a: 1 },
      response: { ok: true },
      durationMs: 12,
    });

    expect(res).toEqual({
      id: savedDoc.id,
      ssuuid: savedDoc.ssuuid,
      method: savedDoc.method,
      path: savedDoc.path,
      statusCode: savedDoc.statusCode,
      ip: savedDoc.ip,
      traceId: savedDoc.traceId,
      request: savedDoc.request,
      response: savedDoc.response,
      durationMs: savedDoc.durationMs,
      createdAt: savedDoc.createdAt,
      updatedAt: savedDoc.updatedAt,
    });
  });

  it('findBySSUUID() paginates and maps', async () => {
    const { ModelCtor, findCursor } = createModelMock();
    const repo = new ApiLogRepository(ModelCtor as any);

    const res = await repo.findBySSUUID('u1', { page: 2, limit: 5 });
    expect((ModelCtor as any).find).toHaveBeenCalledWith({ ssuuid: 'u1' });
    expect(findCursor.skip).toHaveBeenCalledWith(5);
    expect(findCursor.limit).toHaveBeenCalledWith(5);
    expect((ModelCtor as any).countDocuments).toHaveBeenCalledWith({ ssuuid: 'u1' });
    expect(res.total).toBe(1);
    expect(res.data.length).toBe(1);
  });

  it('findPaginated() paginates and maps', async () => {
    const { ModelCtor, findCursor } = createModelMock();
    const repo = new ApiLogRepository(ModelCtor as any);

    const res = await repo.findPaginated({ page: 3, limit: 10 });
    expect((ModelCtor as any).find).toHaveBeenCalled();
    expect(findCursor.skip).toHaveBeenCalledWith(20);
    expect(findCursor.limit).toHaveBeenCalledWith(10);
    expect((ModelCtor as any).countDocuments).toHaveBeenCalled();
    expect(res.total).toBe(1);
    expect(res.data.length).toBe(1);
  });
});


