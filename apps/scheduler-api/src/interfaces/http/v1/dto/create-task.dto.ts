import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Hello from task' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)  // to prevevnt buffer overflow | security handling
  message!: string;
}



