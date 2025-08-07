import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class VerifyAuthDto {
  @ApiProperty({ description: 'The user’s login name' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'The user’s password' })
  @IsString()
  @MinLength(6)
  password: string;
}
