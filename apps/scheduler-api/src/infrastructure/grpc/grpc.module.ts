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
        useFactory: (configService: ConfigService) => {
          const candidates = [
            // for local development
            join(process.cwd(), '../../libs/proto/scheduler.proto'),
            // for docker
            join(process.cwd(), 'libs/proto/scheduler.proto'),
          ];

          const protoPath = candidates.find((p) => existsSync(p));

          if (!protoPath) {
            throw new Error('Could not find scheduler.proto file');
          }
          
          return {
            transport: Transport.GRPC,
            options: {
              package: 'scheduler',
              protoPath,
              url: configService.get('ENGINE_GRPC_URL'),
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
