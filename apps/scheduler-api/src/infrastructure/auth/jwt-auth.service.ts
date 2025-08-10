// src/infrastructure/auth/jwt-auth.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService }                       from '@nestjs/jwt';
import { AuthService }                      from '../../application/ports/auth.service';
import { Credentials }                      from '../../application/dto/credentials.dto';
import { TAuthResult }                      from '@/domain/types/auth/auth-result';
import { UserRepositoryPort } from '@/domain/ports';
import { TtokenPayload } from '@/domain/types/auth/token-payload.type';
import * as crypto from 'crypto';
import { SessionService } from '@/application/session/session.service';


@Injectable()
export class JwtAuthService implements AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepositoryPort,
    @Inject('SessionService') private readonly sessionService: SessionService,
  ) {}

  

 
  async verify(creds: Credentials, ip: string): Promise<TAuthResult>  {
    const user = await this.userRepo.findByUsername(creds.username);
    if (!user) throw new UnauthorizedException('Unauthorized');

    // align with domain hashing (sha256 in entity)
    const hashed = crypto.createHash('sha256').update(creds.password).digest('hex');
    if (hashed !== user.password) throw new UnauthorizedException('Unauthorized');

    const payload: TtokenPayload = { ssuid: user.ssuuid, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);
    await this.sessionService.storeToken(user.ssuuid, accessToken);

    // update last login metadata
    try {
      await this.userRepo.updateLastLogin({ ssuuid: user.ssuuid, lastLoginAt: new Date(), lastLoginIp: ip || null as any });
    } catch {
      // non-blocking
    }

    return { accessToken };
  }

 
  async generateToken(ssuid: string, username: string): Promise<TAuthResult> {
    const payload: TtokenPayload = { ssuid, username };
    const accessToken = await this.jwtService.signAsync(payload);
    await this.sessionService.storeToken(ssuid, accessToken);

    
    const decoded = this.jwtService.decode(accessToken) as { exp: number };
    const now    = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    return {
      accessToken,
      // expiresIn,
    };
  }


  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(accessToken);
      return true;
    } catch {
      return false;
    }
  }
}
