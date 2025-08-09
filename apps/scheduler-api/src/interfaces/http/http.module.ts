import { Module } from '@nestjs/common';
import { AuthController } from './v1/controllers/auth.controller';
import { ApplicationModule } from '@/application/application.module';
import { UserController } from './v1/controllers/user.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './v1/interceptors/logging.interceptor';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    UserController
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class HttpInterfaceModule {}
