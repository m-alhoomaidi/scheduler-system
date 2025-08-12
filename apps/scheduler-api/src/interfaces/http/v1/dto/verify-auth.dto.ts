import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class VerifyAuthDto {
  @ApiProperty({ description: 'The user’s login name', example: 'vrtx1234' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'The user’s password', example: 'vrtx1234' })
  @IsString()
  @MinLength(6)
  password: string;
}
