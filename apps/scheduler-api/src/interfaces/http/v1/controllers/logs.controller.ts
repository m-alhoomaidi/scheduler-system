import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../dto/pagination.dto';
import { ListApiLogsUseCase } from '@/application/use-cases/list-api-logs.use-case';
import { JwtAuth } from '../../decorators/jwt-auth.decorator';

@ApiTags('logs')
@ApiBearerAuth('jwt')
@Controller('v1/logs')
export class LogsController {
  constructor(private readonly listLogs: ListApiLogsUseCase) {}

  @Get()
  @JwtAuth()
  @ApiOperation({ summary: 'List API logs for the current user (paginated)' })
  @ApiResponse({ status: 200 })
  async list(@Query() q: PaginationDto) {
    return this.listLogs.execute({ page: q.page, limit: q.limit });
  }
}
