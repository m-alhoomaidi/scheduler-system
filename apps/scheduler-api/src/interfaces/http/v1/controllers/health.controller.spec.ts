import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('should return ok with service and timestamp', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const res = controller.check();

    expect(res.status).toBe('ok');
    expect(res.service).toBe('scheduler-api');
    expect(typeof res.timestamp).toBe('string');
    expect(() => new Date(res.timestamp)).not.toThrow();
  });
});
