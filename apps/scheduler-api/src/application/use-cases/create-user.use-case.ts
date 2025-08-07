// src/application/usecases/create-user.use-case.ts
import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '../../domain/entities/user.entity';
import { CreateUserCommand } from '../dto/create-user.command';
import { UserRepositoryPort } from '@/domain/ports';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(cmd: CreateUserCommand): Promise<{ id: string }> {
    const existing = await this.userRepo.findByUsername(cmd.username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    const hash = await bcrypt.hash(cmd.password, 10);
    const id = uuid();
    const user = new User(id, cmd.username, hash);
    await this.userRepo.save(user);
    return { id };
  }
}
