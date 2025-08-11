import { JwtSessionGuard } from './jwt-session.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtSessionGuard', () => {
  const sessionService = {
    isValidSession: jest.fn(),
    renewSession: jest.fn(),
  } as any;

  const next = new JwtSessionGuard(sessionService);

  const ctx = {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization: 'Bearer token' }, user: { ssuid: 'u1' } }),
    }),
  } as unknown as ExecutionContext;

  it('allows when session valid', async () => {
    (JwtSessionGuard as any).prototype.__proto__.canActivate = jest.fn().mockResolvedValue(true);
    sessionService.isValidSession.mockResolvedValueOnce(true);
    await expect(next.canActivate(ctx)).resolves.toBe(true);
    expect(sessionService.renewSession).toHaveBeenCalledWith('u1', 'token');
  });

  it('rejects when session invalid', async () => {
    (JwtSessionGuard as any).prototype.__proto__.canActivate = jest.fn().mockResolvedValue(true);
    sessionService.isValidSession.mockResolvedValueOnce(false);
    await expect(next.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});



