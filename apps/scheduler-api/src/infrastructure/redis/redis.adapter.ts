import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RedisPort } from '../../domain/ports/redis.port';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisAdapter implements RedisPort, OnModuleInit, OnModuleDestroy {
  private readonly subscriber: RedisClient;
  private readonly logger = new Logger(RedisAdapter.name);

  constructor(@Inject('REDIS_CLIENT') private readonly client: RedisClient) {
    // make a separate subscriber connection
    this.subscriber = new Redis(client.options);
  }

  async onModuleInit() {
    await this.client.ping();
    this.logger.log('✅ Connected to Redis');
    this.subscriber.on('error', (e) =>
      this.logger.error('Subscriber error', e),
    );
  }

  onModuleDestroy() {
    this.client.disconnect();
    this.subscriber.disconnect();
    this.logger.log('🛑 Disconnected from Redis');
  }

  async get<T = string>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const str = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, str, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, str);
    }
  }

  async del(...keys: string[]): Promise<void> {
    await this.client.del(...keys);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  async subscribe(
    channel: string,
    handler: (message: string) => void,
  ): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (_chan, msg) => handler(msg));
  }
}
