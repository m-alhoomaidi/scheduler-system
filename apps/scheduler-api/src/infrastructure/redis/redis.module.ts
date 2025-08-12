import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisAdapter } from './redis.adapter';
import { RedisPort } from '@domain/ports/redis.port';

@Global()
@Module({})
export class RedisModule {
  static registerAsync(): DynamicModule {
    return {
      global: true,
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: (cfg: ConfigService) => {
            return new Redis({
              host: cfg.get('REDIS_HOST', 'localhost'),
              port: cfg.get<number>('REDIS_PORT', 6379),
              password: cfg.get('REDIS_PASSWORD'),
            });
          },
          inject: [ConfigService],
        },
        {
          provide: RedisPort,
          useClass: RedisAdapter,
        },
        RedisAdapter,
      ],
      exports: [RedisPort, 'REDIS_CLIENT'],
    };
  }
}
