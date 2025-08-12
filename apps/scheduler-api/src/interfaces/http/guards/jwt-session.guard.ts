import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionService } from '@/application/session/session.service';
import { AuthenticatedRequest } from '../v1/types/authenticated-request.interface';

@Injectable()
export class JwtSessionGuard extends AuthGuard('jwt') {
  constructor(
    @Inject('SessionService') private readonly sessionService: SessionService,
  ) {
    super();
  }

  async canActivate(ctx: ExecutionContext) {
    const ok = (await super.canActivate(ctx)) as boolean;
    if (!ok) return false;

    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = req.headers.authorization;
    if (!auth) return false;
    const token = auth.replace(/^Bearer\s+/, '');
    const { ssuid } = req.user;

    const valid = await this.sessionService.isValidSession(ssuid, token);
    if (!valid) {
      throw new UnauthorizedException('Session expired');
    }

    // renew session
    await this.sessionService.renewSession(ssuid, token);
    return true;
  }
}
