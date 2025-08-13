import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuth } from '../../decorators/jwt-auth.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @JwtAuth()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'scheduler-api',
    };
  }
}
