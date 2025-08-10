// src/infrastructure/mongo/mongo-persistence.module.ts
import { Global, Module, DynamicModule } from '@nestjs/common';
import {
  MongooseModule,
  MongooseModuleAsyncOptions,
} from '@nestjs/mongoose';

// your schema factories
import {
  UserSchemaFactory,
  ApiLogSchemaFactory,
  ScheduledTaskQueueSchemaFactory,
} from './models';

const FEATURE_SCHEMAS = [
  { name: 'User', schema: UserSchemaFactory },
  { name: 'ApiLog', schema: ApiLogSchemaFactory },
  { name: 'ScheduledTaskQueue', schema: ScheduledTaskQueueSchemaFactory },
];

@Global()
@Module({})
export class MongoPersistenceModule {
  /**
   * Asynchronously register MongoDB connection and all schemas.
   * Use this in your InfrastructureModule (with ConfigService, Vault, etc).
   */ 
  static registerAsync(
    options: MongooseModuleAsyncOptions
  ): DynamicModule {
    return {
      module: MongoPersistenceModule,
      imports: [
        MongooseModule.forRootAsync(options),

        MongooseModule.forFeature(FEATURE_SCHEMAS),
      ],
      exports: [MongooseModule],
    };
  }
}
