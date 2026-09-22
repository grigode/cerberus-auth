import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@core/shared-server';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get(Reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    const request = { user };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if route is marked as @Public()', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext(undefined);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access if user is authenticated', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({
      id: '123',
      email: 'test@example.com',
      role: 'USER',
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if user is not authenticated on protected route', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
