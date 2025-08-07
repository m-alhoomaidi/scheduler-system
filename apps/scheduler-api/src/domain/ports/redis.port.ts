export abstract class RedisPort {
    abstract get<T = string>(key: string): Promise<T | null>;
    abstract set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    abstract del(...keys: string[]): Promise<void>;
    abstract expire(key: string, seconds: number): Promise<void>;
    abstract publish(channel: string, message: string): Promise<void>;
    abstract subscribe(channel: string, handler: (message: string) => void): Promise<void>;
  }
  