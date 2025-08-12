import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@application/ports/auth.service';
import { Credentials } from '@application/dto/credentials.dto';
import { TAuthResult } from '@/domain/types/auth/auth-result';
import { UserRepositoryPort } from '@/domain/ports';
import { TtokenPayload } from '@/domain/types/auth/token-payload.type';
import { SessionService } from '@/application/session/session.service';
import { LoggerPort } from '@/application/ports/logger.port';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtAuthService implements AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepositoryPort,
    @Inject('SessionService') private readonly sessionService: SessionService,
    private readonly logger: LoggerPort,
  ) {}

  async verify(creds: Credentials, ip: string): Promise<TAuthResult> {
    const user = await this.userRepo.findByUsername(creds.username);
    if (!user) {
      this.logger.error('User not found', { username: creds.username });
      throw new UnauthorizedException('Invalid credentials'); // should not reveal the user is not found or the password is incorrect is not a security issue
    }

    const hashed = await bcrypt.compare(creds.password, user.password);
    if (!hashed) {
      this.logger.error('Invalid password', { username: creds.username });
      throw new UnauthorizedException('Invalid credentials'); // should not reveal the user is not found or the password is incorrect is not a security issue
    }

    const payload: TtokenPayload = {
      ssuid: user.ssuuid,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    await this.sessionService.storeToken(user.ssuuid, accessToken);

    // update last login metadata
    try {
      await this.userRepo.updateLastLogin({
        ssuuid: user.ssuuid,
        lastLoginAt: new Date(),
        lastLoginIp: ip || 'unknown',
      });
    } catch {
      this.logger.error('Failed to update last login metadata', {
        username: user.username,
      });
    }

    return { accessToken };
  }

  async generateToken(ssuid: string, username: string): Promise<TAuthResult> {
    const payload: TtokenPayload = { ssuid, username };
    const accessToken = await this.jwtService.signAsync(payload);
    await this.sessionService.storeToken(ssuid, accessToken);

    return {
      accessToken,
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
