import { Injectable, Inject } from '@nestjs/common';
import { Redis as RedisClient } from 'ioredis';
import { SessionService } from '@application/session/session.service';
import { sessionKey } from './redis.utils';

@Injectable()
export class RedisSessionService implements SessionService {
  // TODO improve this, (future work) - ttl based user
  private readonly ttl = 300; // 5 minutes

  constructor(@Inject('REDIS_CLIENT') private readonly client: RedisClient) {}

  async storeToken(ssuid: string, token: string) {
    const key = sessionKey(ssuid, token);
    await this.client.set(key, '1', 'EX', this.ttl);
  }

  async renewSession(ssuid: string, token: string) {
    const key = sessionKey(ssuid, token);
    // only renew if exists
    const exists = await this.client.expire(key, this.ttl);
    if (!exists) throw new Error('Session expired');
  }

  async destroySession(ssuid: string, token: string) {
    const key = sessionKey(ssuid, token);
    await this.client.del(key);
  }

  async isValidSession(ssuid: string, token: string) {
    const key = sessionKey(ssuid, token);
    const ttl = await this.client.ttl(key);
    return ttl > 0;
  }
}
