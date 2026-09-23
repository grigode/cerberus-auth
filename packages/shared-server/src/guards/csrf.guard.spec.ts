import type { ExecutionContext } from '@nestjs/common';
import { CsrfGuard } from './csrf.guard';
import type { SecurityConfigService } from '@core/config';
import { ForbiddenApplicationException } from '../application/exceptions';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  let securityConfigMock: jest.Mocked<SecurityConfigService>;

  beforeEach(() => {
    securityConfigMock = {
      CORS_ORIGINS: ['http://localhost:3000', 'https://app.example.com'],
    } as unknown as jest.Mocked<SecurityConfigService>;

    guard = new CsrfGuard(securityConfigMock);
  });

  const createMockContext = (
    request: Record<string, unknown>,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it('should allow safe HTTP methods regardless of cookies', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      const context = createMockContext({
        method,
        cookies: { refreshToken: 'token' },
      });
      expect(guard.canActivate(context)).toBe(true);
    }
  });

  it('should allow mutating methods when no cookies are present', () => {
    const context = createMockContext({
      method: 'POST',
      headers: {},
      cookies: {},
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow mutating methods with cookies if x-requested-with is present', () => {
    const context = createMockContext({
      method: 'POST',
      headers: {
        cookie: 'session=123',
        'x-requested-with': 'XMLHttpRequest',
      },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow mutating methods with cookies if x-csrf-token is present', () => {
    const context = createMockContext({
      method: 'POST',
      headers: {
        cookie: 'session=123',
        'x-csrf-token': 'token123',
      },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow mutating methods with cookies if Origin matches CORS_ORIGINS', () => {
    const context = createMockContext({
      method: 'POST',
      headers: {
        cookie: 'session=123',
        origin: 'http://localhost:3000',
      },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow mutating methods with cookies if Origin matches Host header', () => {
    const context = createMockContext({
      method: 'POST',
      headers: {
        cookie: 'session=123',
        host: 'api.example.com',
        origin: 'https://api.example.com',
      },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow mutating methods with cookies if Referer matches CORS_ORIGINS', () => {
    const context = createMockContext({
      method: 'POST',
      headers: {
        cookie: 'session=123',
        referer: 'https://app.example.com/dashboard',
      },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenApplicationException when cookies are present but Origin and Referer are missing', () => {
    const context = createMockContext({
      method: 'POST',
      headers: {
        cookie: 'session=123',
      },
    });
    expect(() => guard.canActivate(context)).toThrow(
      ForbiddenApplicationException,
    );
  });

  it('should throw ForbiddenApplicationException when Origin is untrusted cross-origin', () => {
    const context = createMockContext({
      method: 'POST',
      headers: {
        cookie: 'session=123',
        origin: 'http://evil-attacker.com',
      },
    });
    expect(() => guard.canActivate(context)).toThrow(
      ForbiddenApplicationException,
    );
  });
});
