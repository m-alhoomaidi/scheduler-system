// src/infrastructure/auth/jwt-auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService }                       from '@nestjs/jwt';
import { AuthService }                      from '../../application/ports/auth.service';
import { Credentials }                      from '../../application/dto/credentials.dto';
import { TAuthResult }                      from '@/domain/types/auth/auth-result';
import { UserRepositoryPort } from '@/domain/ports';
import { TtokenPayload } from '@/domain/types/auth/token-payload.type';


@Injectable()
export class JwtAuthService implements AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepositoryPort
  ) {}

  

 
  async verify(creds: Credentials): Promise<TAuthResult>  {
    const user = await this.userRepo.findByUsername(creds.username);
    console.log('***user',user)
    if (!user) 
      throw new UnauthorizedException('Unutherized ')

    // const passwordsMatch = await user.validatePassword(creds.password);
    // return passwordsMatch;

    const payload: TtokenPayload = {ssuid:user.ssuuid, username:user.username}
    const accessToken = await this.jwtService.signAsync(payload);

    
    const decoded = this.jwtService.decode(accessToken) as { exp: number };
    const now    = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    return {
      accessToken,
      // expiresIn,
    };
  }

 
  async generateToken(ssuid: string, username: string): Promise<TAuthResult> {
    const payload: TtokenPayload = { ssuid, username };
    const accessToken = await this.jwtService.signAsync(payload);

    
    const decoded = this.jwtService.decode(accessToken) as { exp: number };
    const now    = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    return {
      accessToken,
      // expiresIn,
    };
  }


  async validateToken(accessToken: string): Promise<boolean> {
    const decoded = await this.jwtService.decode(accessToken) as { exp: number };

    if(decoded) return true

    return false

  }
}
