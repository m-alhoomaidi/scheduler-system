import { Module } from '@nestjs/common';
import { AuthController } from './v1/controllers/auth.controller';
import { ApplicationModule } from '@/application/application.module';
import { UserController } from './v1/controllers/user.controller';
import { TaskController } from './v1/controllers/task.controller';
import { LogsController } from './v1/controllers/logs.controller';
import { HealthController } from './v1/controllers/health.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './v1/interceptors/logging.interceptor';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    UserController,
    TaskController,
    HealthController,
    LogsController,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR, // nestjs built-in interceptor for all requests
      useClass: LoggingInterceptor, // logging interceptor for all requests
    },
  ],
})
export class HttpInterfaceModule {}
