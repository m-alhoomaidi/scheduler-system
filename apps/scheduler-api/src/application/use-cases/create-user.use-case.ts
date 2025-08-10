import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { User } from '../../domain/entities/user.entity';
import { CreateUserCommand } from '../dto/create-user.command';
import { UserRepositoryPort } from '@/domain/ports';
import { LoggerPort } from '../ports/logger.port';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort,
    private readonly logger: LoggerPort
  ) {}

  async execute(cmd: CreateUserCommand): Promise<{ id: string }> {
    const existing = await this.userRepo.findByUsername(cmd.username);
    if (existing) {
      this.logger.error('Username already taken', { username: cmd.username });
      throw new ConflictException('Username already taken');
    }

    const ssuuid = uuid(); // For production, consider using a more structured format like shc-000000-000000-000000-000000-000000
    try {
      const user = new User(ssuuid, cmd.username, cmd.password, 'USER', null, null, new Date(), new Date(), null);
      await this.userRepo.create(user);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Invalid user data');
    }
    return { id: ssuuid };
  }
}
