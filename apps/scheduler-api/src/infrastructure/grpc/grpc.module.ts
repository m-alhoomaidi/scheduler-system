import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { TaskEngineGrpcClient } from './task-engine.client';

@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'TASK_ENGINE_GRPC',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => {
          const candidates = [
            join(process.cwd(), '../../libs/proto/scheduler.proto'),
          
          ];
          const protoPath = candidates.find((p) => existsSync(p)) ?? candidates[0];
          return {
            transport: Transport.GRPC,
            options: {
              package: 'scheduler',
              protoPath,
              url: cfg.get<string>('ENGINE_GRPC_URL', '0.0.0.0:50051'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [TaskEngineGrpcClient],
  exports: [TaskEngineGrpcClient],
})
export class GrpcModule {}


