import { User, UserRole } from '../entities';

export type CreateUserParams = {
  ssuuid: string;
  username: string;
  password: string;
  role: UserRole;
};

export type UpdateLastLoginParams = {
  ssuuid: string;
  lastLoginAt: Date;
  lastLoginIp: string;
};

export abstract class UserRepositoryPort {
  abstract create(user: User): Promise<User>;

  abstract updateLastLogin(
    userData: UpdateLastLoginParams,
  ): Promise<User | null>;

  abstract findBySSUUID(ssuuid: string): Promise<User | null>;

  abstract findByUsername(username: string): Promise<User | null>;

  abstract softDelete(ssuuid: string, deletedAt: Date): Promise<void>;
}
