import { Test, type TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { CustomThrottlerGuard } from './custom-throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60000,
            limit: 100,
          },
        ]),
      ],
      providers: [CustomThrottlerGuard],
    }).compile();

    guard = module.get<CustomThrottlerGuard>(CustomThrottlerGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return IP as tracker when email is not present in body', async () => {
    const req = {
      ip: '192.168.1.1',
      body: {},
    };

    const tracker = await (
      guard as unknown as { getTracker: (r: unknown) => Promise<string> }
    ).getTracker(req);
    expect(tracker).toBe('192.168.1.1');
  });

  it('should return ip-email as tracker when email is present in body', async () => {
    const req = {
      ip: '192.168.1.1',
      body: {
        email: 'Test@Example.com ',
      },
    };

    const tracker = await (
      guard as unknown as { getTracker: (r: unknown) => Promise<string> }
    ).getTracker(req);
    expect(tracker).toBe('192.168.1.1-test@example.com');
  });

  it('should fallback to x-forwarded-for header if req.ip is not available', async () => {
    const req = {
      headers: {
        'x-forwarded-for': '10.0.0.1',
      },
      body: {},
    };

    const tracker = await (
      guard as unknown as { getTracker: (r: unknown) => Promise<string> }
    ).getTracker(req);
    expect(tracker).toBe('10.0.0.1');
  });
});
