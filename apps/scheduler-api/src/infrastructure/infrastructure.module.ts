import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoPersistenceModule } from './persistence/mongo/mongo.module';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { RedisSessionService } from './session/redis-session.service';
import { AuthModule } from './auth/auth.module';
import { UserRepositoryPort } from '@/domain/ports';
import { UserRepository } from './persistence/mongo/repositories/user.repository';
import { AuthService } from '@/application/ports/auth.service';
import { JwtAuthService } from './auth/jwt-auth.service';
import { ApiLogRepository } from './persistence/mongo/repositories/api-log.repository';
import { ApiLogRepositoryPort } from '@/domain/ports';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongoPersistenceModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): MongooseModuleOptions => {
        const mongoUri = config.get<string>('MONGO_URI');
        
        if (!mongoUri) {
          throw new Error(
            'MONGO_URI environment variable is not set. Please set MONGO_URI in your environment variables.'
          );
        }


        return {
          uri: mongoUri,
          
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              console.log('MongoDB connected successfully');
            });

            connection.on('error', (err) => {
              console.error('MongoDB connection error:', err);
            });

            connection.on('disconnected', () => {
              console.warn('MongoDB disconnected');
            });

            connection.on('reconnected', () => {
              console.log('MongoDB reconnected');
            });

            return connection;
          },

          maxPoolSize: 10,
          minPoolSize: 2,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferCommands: false,

          retryWrites: true,
          retryReads: true,
        };
      },
    }),
    RedisModule.registerAsync() ,
    AuthModule
  ],
  providers:[
    {
      provide: 'SessionService',
      useClass: RedisSessionService,
    },  
    {
      provide:UserRepositoryPort,
      useClass:UserRepository
    },
    {
      provide:AuthService,
      useClass:JwtAuthService
    },
    {
      provide: ApiLogRepositoryPort,
      useClass: ApiLogRepository,
    }
    

  ],
  exports: [MongoPersistenceModule,
    'SessionService',AuthModule,UserRepositoryPort,AuthService,ApiLogRepositoryPort
  ],
})
export class InfrastructureModule {}
