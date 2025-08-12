import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuth } from '../../decorators/jwt-auth.decorator';
import { CreateTaskDto } from '../dto/create-task.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { CreateTaskUseCase } from '@/application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from '@/application/use-cases/delete-task.use-case';
import { ListTasksUseCase } from '@/application/use-cases/list-tasks.use-case';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';

@ApiTags('tasks')
@ApiBearerAuth('jwt')
@Controller('v1/tasks')
export class TaskController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
    private readonly listTasks: ListTasksUseCase,
  ) {}

  @Post()
  @JwtAuth()
  // @UseInterceptors(IdempotencyInterceptor)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Create a scheduled task (idempotent with Idempotency-Key header)',
  })
  async create(@Body() dto: CreateTaskDto, @Req() req: AuthenticatedRequest) {
    const { ssuid } = req.user;
    return this.createTask.execute({ ssuuid: ssuid, message: dto.message });
  }

  @Delete(':id')
  @JwtAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a scheduled task' })
  async delete(@Param('id') id: string) {
    await this.deleteTask.execute({ taskId: id });
  }

  @Get()
  @JwtAuth()
  @ApiOperation({ summary: 'List scheduled tasks (paginated)' })
  @ApiResponse({ status: 200 })
  async list(@Query() q: PaginationDto, @Req() req: AuthenticatedRequest) {
    const { ssuid } = req.user;
    return this.listTasks.execute({
      ssuuid: ssuid,
      page: q.page,
      limit: q.limit,
    });
  }

  @Get('ping')
  @JwtAuth()
  @ApiOperation({ summary: 'Ping the task engine service (gRPC test)' })
  @ApiResponse({ status: 200 })
  async ping() {
    return this.createTask.pingEngine();
  }
}
