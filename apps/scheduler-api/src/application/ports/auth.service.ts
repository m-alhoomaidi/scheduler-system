import { TAuthResult } from '@/domain/types/auth/auth-result';
import { Credentials } from '../dto/credentials.dto';

export abstract class AuthService {
 abstract verify(creds: Credentials): Promise<TAuthResult>;
 abstract validateToken(accessToken:string):Promise<boolean>
}
