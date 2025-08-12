import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IdempotencyDto } from './idempetency.dto';

export class CreateTaskDto extends IdempotencyDto {
  @ApiProperty({ example: 'Hello from task' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500) // to prevevnt buffer overflow | security handling
  message!: string;
}
