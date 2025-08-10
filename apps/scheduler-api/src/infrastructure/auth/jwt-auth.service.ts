
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@application/ports/auth.service';
import { Credentials } from '@application/dto/credentials.dto';
import { TAuthResult }  from '@/domain/types/auth/auth-result';
import { UserRepositoryPort } from '@/domain/ports';
import { TtokenPayload } from '@/domain/types/auth/token-payload.type';
import * as crypto from 'crypto';
import { SessionService } from '@/application/session/session.service';
import { LoggerPort } from '@/application/ports/logger.port';


@Injectable()
export class JwtAuthService implements AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepositoryPort,
    @Inject('SessionService') private readonly sessionService: SessionService,
    private readonly logger: LoggerPort
  ) {}



 
  async verify(creds: Credentials, ip: string): Promise<TAuthResult>  {
    const user = await this.userRepo.findByUsername(creds.username);
    if (!user) {
      this.logger.error('User not found', { username: creds.username });
      throw new UnauthorizedException('Invalid credentials'); // should not reveal the user is not found or the password is incorrect is not a security issue
    }



    const hashed = crypto.createHash('sha256').update(creds.password).digest('hex');
    if (hashed !== user.password) {
      this.logger.error('Invalid password', { username: creds.username });
      throw new UnauthorizedException('Invalid credentials'); // should not reveal the user is not found or the password is incorrect is not a security issue
    }

    const payload: TtokenPayload = { ssuid: user.ssuuid, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);
    await this.sessionService.storeToken(user.ssuuid, accessToken);

    // update last login metadata
    try {
      await this.userRepo.updateLastLogin({ ssuuid: user.ssuuid, lastLoginAt: new Date(), lastLoginIp: ip || null as any });
    } catch {
      this.logger.error('Failed to update last login metadata', { username: user.username });
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
