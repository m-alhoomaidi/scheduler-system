import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Desired login username' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Plain-text password' })
  @IsString()
  @MinLength(6)
  password: string;
}
