import { CreateUserUseCase } from './create-user.use-case';
import { UserRepositoryPort } from '@/domain/ports';
import { LoggerPort } from '../ports/logger.port';
import { ConflictException } from '@nestjs/common';
import { User } from '@/domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  const userRepo: jest.Mocked<UserRepositoryPort> = {
    create: jest.fn(),
    findByUsername: jest.fn(),
    updateLastLogin: jest.fn() as any,
  } as any;

  const logger: jest.Mocked<LoggerPort> = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    alert: jest.fn(),
    audit: jest.fn(),
    child: jest.fn() as any,
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates a user when username is free', async () => {
    userRepo.findByUsername.mockResolvedValueOnce(null);
    userRepo.create.mockResolvedValueOnce(undefined as any);

    const useCase = new CreateUserUseCase(userRepo, logger);
    const result = await useCase.execute({ username: 'johnsmith', password: 'password123' });

    expect(result).toHaveProperty('id');
    expect(userRepo.create).toHaveBeenCalled();

    const savedUser = (userRepo.create.mock.calls[0][0]) as User;
    expect(savedUser.username).toBe('johnsmith');
    expect(savedUser.password).not.toBe('password123');
  });

  it('throws ConflictException if username exists', async () => {
    userRepo.findByUsername.mockResolvedValueOnce({} as any);
    const useCase = new CreateUserUseCase(userRepo, logger);

    await expect(useCase.execute({ username: 'taken', password: 'password123' })).rejects.toBeInstanceOf(ConflictException);
    expect(logger.error).toHaveBeenCalled();
  });
});


