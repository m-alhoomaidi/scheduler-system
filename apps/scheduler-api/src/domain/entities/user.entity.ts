// following the DDD pattern, the entity is the root of the aggregate
import * as crypto from 'crypto';

export type UserRole = 'USER' | 'ADMIN';

export class User {
  constructor(
    public readonly ssuuid: string,
    public username: string,
    public password: string,
    public role: UserRole,
    public lastLoginAt: Date | null = null,
    public lastLoginIp: string | null = null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public deletedAt: Date | null = null,
    options?: { isHashed?: boolean; skipValidation?: boolean },
  ) {
    const isHashed = options?.isHashed === true;
    const skipValidation = options?.skipValidation === true;

    this.password = isHashed ? password : this.hashPassword(password);

    if (!skipValidation) {
      if (!this.validateUsername(username))
        throw new Error('Username must be between 3 and 20 characters');
      // Only validate plaintext length when not hashed
      if (!isHashed && !this.validatePassword(password))
        throw new Error('Password must be between 8 and 20 characters');
      if (!this.validateRole(role))
        throw new Error('Role must be USER or ADMIN');
    }
  }

  // handle the password hashing and validation
  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // the core business logic should be in the entity layer, since it's part of the domain

  validateUsername(username: string): boolean {
    return username.length > 3 && username.length < 20;
  }

  validatePassword(password: string): boolean {
    return password.length >= 8 && password.length <= 20;
  }

  validateRole(role: UserRole): boolean {
    return role === 'USER' || role === 'ADMIN';
  }
}
