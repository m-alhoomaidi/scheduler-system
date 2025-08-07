import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtSessionGuard }             from '../guards/jwt-session.guard';

export function JwtAuth() {
  return applyDecorators(
    UseGuards(JwtSessionGuard),
  );
}
