import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpInterfaceModule } from './interfaces/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpInterfaceModule
  ],
})
export class AppModule {}
