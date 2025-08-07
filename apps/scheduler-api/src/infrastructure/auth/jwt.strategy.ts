import { TtokenPayload } from '@/domain/types/auth/token-payload.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET') as string,
      ignoreExpiration: false,
    });
  }

  // Use TokenPayload instead of any
  async validate(payload: TtokenPayload): Promise<{ ssuid: string; username: string }> {
    // you can further type this return value as a UserPrincipal VO if you have one
    return { username: payload.username,
      ssuid:payload.ssuid
     };
  }
}
