import { RedisAdapter } from './redis.adapter';

// Mock ioredis constructor used for subscriber connection inside RedisAdapter
jest.mock('ioredis', () => {
  const instances: any[] = [];

  const RedisMock = jest.fn().mockImplementation((options?: any) => {
    const instance: any = {
      options,
      _events: {} as Record<string, Function>,
      on: jest.fn(function (this: any, event: string, cb: Function) {
        this._events[event] = cb;
      }),
      subscribe: jest.fn().mockResolvedValue(1),
      disconnect: jest.fn(),
      publish: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      ping: jest.fn().mockResolvedValue('PONG'),
    };
    instances.push(instance);
    return instance;
  });

  // expose instances for assertions
  (RedisMock as any).__instances = instances;

  return {
    __esModule: true,
    default: RedisMock,
    Redis: RedisMock,
  };
});

describe('RedisAdapter', () => {
  function createClientMock() {
    return {
      options: { host: 'localhost', port: 6379 },
      on: jest.fn(),
      subscribe: jest.fn(),
      disconnect: jest.fn(),
      publish: jest.fn().mockResolvedValue(1),
      get: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      ping: jest.fn().mockResolvedValue('PONG'),
    } as any;
  }

  it('initializes and disconnects correctly', async () => {
    const client = createClientMock();
    const adapter = new RedisAdapter(client);

    await adapter.onModuleInit();
    expect(client.ping).toHaveBeenCalled();

    adapter.onModuleDestroy();
    expect(client.disconnect).toHaveBeenCalled();

    // ensure subscriber instance was created and disconnected
    const Redis = require('ioredis').default as jest.Mock;
    const instances: any[] = (Redis as any).__instances;
    const subscriber = instances[instances.length - 1];
    expect(subscriber.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(subscriber.disconnect).toHaveBeenCalled();
  });

  it('get() parses JSON or returns null', async () => {
    const client = createClientMock();
    (client.get as jest.Mock).mockResolvedValueOnce(null);
    const adapter = new RedisAdapter(client);

    await expect(adapter.get('missing')).resolves.toBeNull();

    (client.get as jest.Mock).mockResolvedValueOnce(JSON.stringify({ a: 1 }));
    await expect(adapter.get<{ a: number }>('k')).resolves.toEqual({ a: 1 });
  });

  it('set() stringifies and respects ttl', async () => {
    const client = createClientMock();
    const adapter = new RedisAdapter(client);

    await adapter.set('k1', { x: 1 });
    expect(client.set).toHaveBeenCalledWith('k1', JSON.stringify({ x: 1 }));

    await adapter.set('k2', { y: 2 }, 30);
    expect(client.set).toHaveBeenCalledWith(
      'k2',
      JSON.stringify({ y: 2 }),
      'EX',
      30,
    );
  });

  it('del/expire/publish proxy to client', async () => {
    const client = createClientMock();
    const adapter = new RedisAdapter(client);

    await adapter.del('a', 'b');
    expect(client.del).toHaveBeenCalledWith('a', 'b');

    await adapter.expire('a', 10);
    expect(client.expire).toHaveBeenCalledWith('a', 10);

    await adapter.publish('chan', 'msg');
    expect(client.publish).toHaveBeenCalledWith('chan', 'msg');
  });

  it('subscribe() subscribes and invokes handler on message', async () => {
    const client = createClientMock();
    const adapter = new RedisAdapter(client);

    const handler = jest.fn();
    await adapter.subscribe('news', handler);

    const Redis = require('ioredis').default as jest.Mock;
    const instances: any[] = (Redis as any).__instances;
    const subscriber = instances[instances.length - 1];

    expect(subscriber.subscribe).toHaveBeenCalledWith('news');
    // simulate message event
    expect(subscriber._events['message']).toBeDefined();
    subscriber._events['message']('news', 'hello');
    expect(handler).toHaveBeenCalledWith('hello');
  });
});
