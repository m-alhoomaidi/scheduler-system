import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Inject,
  } from '@nestjs/common';
  import { AuthGuard }  from '@nestjs/passport';
  import { SessionService }    from '@/application/session/session.service';
  
  @Injectable()
  export class JwtSessionGuard extends AuthGuard('jwt') {
    constructor(@Inject('SessionService') private readonly sessionService: SessionService) {
      super();
    }
  
    async canActivate(ctx: ExecutionContext) {
      const ok = (await super.canActivate(ctx)) as boolean;
      if (!ok) return false;
  
      const req   = ctx.switchToHttp().getRequest();
      const auth  = req.headers.authorization as string;
      const token = auth.replace(/^Bearer\s+/, '');
      const { ssuid } = req.user as { ssuid: string };
  
      const valid = await this.sessionService.isValidSession(ssuid, token);
      if (!valid) {
        throw new UnauthorizedException('Session expired');
      }
      
      // renew session
      await this.sessionService.renewSession(ssuid, token);
      return true;
    }
  }
  