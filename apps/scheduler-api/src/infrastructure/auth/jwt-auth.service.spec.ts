import { Test } from '@nestjs/testing';
import { JwtAuthService } from './jwt-auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryPort } from '@/domain/ports';
import { SessionService } from '@/application/session/session.service';
import { LoggerPort } from '@/application/ports/logger.port';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthService', () => {
  let service: JwtAuthService;

  const jwt = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;
  const repo: jest.Mocked<UserRepositoryPort> = {
    findByUsername: jest.fn(),
    create: jest.fn() as any,
    updateLastLogin: jest.fn() as any,
  } as any;
  const session: jest.Mocked<SessionService> = {
    storeToken: jest.fn(),
    isValidSession: jest.fn() as any,
    renewSession: jest.fn() as any,
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

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtAuthService,
        { provide: JwtService, useValue: jwt },
        { provide: 'SessionService', useValue: session },
        { provide: UserRepositoryPort, useValue: repo as any },
        { provide: LoggerPort, useValue: logger },
      ],
    }).compile();

    service = moduleRef.get(JwtAuthService);
  });

  // it('verifies credentials and issues token', async () => {
  //   repo.findByUsername.mockResolvedValueOnce({ ssuuid: 'u1', username: 'jane', password: '8d969eef6ecad3c29a3a629280e686cf' + 'a' .repeat(24) } as any);
  //   jwt.signAsync = jest.fn().mockResolvedValue('token-123') as any;
  //   jwt.decode = jest.fn().mockReturnValue({ exp: Math.floor(Date.now()/1000) + 3600 }) as any;

  //   const res = await service.verify({ username: 'jane', password: '12345678' } as any, '127.0.0.1');

  //   expect(res).toEqual({ accessToken: 'token-123' });
  //   expect(session.storeToken).toHaveBeenCalledWith('u1', 'token-123');
  //   expect(repo.updateLastLogin).toHaveBeenCalled();
  // });

  it('throws on invalid username', async () => {
    repo.findByUsername.mockResolvedValueOnce(null);
    await expect(
      service.verify({ username: 'nope', password: 'x' } as any, ''),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('validates token true/false', async () => {
    (jwt.verifyAsync as any) = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('bad'));
    await expect(service.validateToken('ok')).resolves.toBe(true);
    await expect(service.validateToken('bad')).resolves.toBe(false);
  });
});
