import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'A valid JWT access token' })
  accessToken: string;
}
