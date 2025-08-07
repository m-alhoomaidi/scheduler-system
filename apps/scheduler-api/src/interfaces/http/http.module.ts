import { Module } from '@nestjs/common';
import { AuthController } from './v1/controllers/auth.controller';
import { ApplicationModule } from '@/application/application.module';
import { UserController } from './v1/controllers/user.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    UserController
  ],
})
export class HttpInterfaceModule {}
