import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AuthGuard }               from '@nestjs/passport';
  import { SessionService }          from '@application/session/session.service';
  
  @Injectable()
  export class JwtSessionGuard extends AuthGuard('jwt') {
    constructor(private readonly sessionService: SessionService) {
      super();
    }
  
    async canActivate(ctx: ExecutionContext) {
      // 1. Validate JWT signature & expiration
      const ok = (await super.canActivate(ctx)) as boolean;
      if (!ok) return false;
  
      const req   = ctx.switchToHttp().getRequest();
      const auth  = req.headers.authorization as string;
      const token = auth.replace(/^Bearer\s+/, '');
      const { ssuid } = req.user as { ssuid: string };
  
      // 2. Ensure session exists in Redis
      const valid = await this.sessionService.isValidSession(ssuid, token);
      if (!valid) {
        throw new UnauthorizedException('Session expired');
      }
  
      // 3. Renew TTL back to 5 minutes
      await this.sessionService.renewSession(ssuid, token);
      return true;
    }
  }
  