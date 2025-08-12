import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { CreateTaskUseCase } from './use-cases/create-task.use-case';
import { DeleteTaskUseCase } from './use-cases/delete-task.use-case';
import { ListTasksUseCase } from './use-cases/list-tasks.use-case';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { ListApiLogsUseCase } from './use-cases/list-api-logs.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CreateTaskUseCase,
    DeleteTaskUseCase,
    ListTasksUseCase,
    CreateUserUseCase,
    ListApiLogsUseCase,
  ],
  exports: [
    InfrastructureModule,
    CreateTaskUseCase,
    DeleteTaskUseCase,
    ListTasksUseCase,
    CreateUserUseCase,
    ListApiLogsUseCase,
  ],
})
export class ApplicationModule {}
