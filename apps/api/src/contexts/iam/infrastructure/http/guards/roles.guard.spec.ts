import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import { RoleVo } from '@core/domain';
import type { AuthenticatedUser } from '@core/domain';

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  const createMockContext = (
    user?: Partial<AuthenticatedUser>,
    rawUser?: Partial<AuthenticatedUser>,
  ): ExecutionContext => {
    const request = {
      user,
      raw: rawUser ? { user: rawUser } : undefined,
    };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if no required roles are defined', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext();

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access if required roles array is empty', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockContext();

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleVo.ADMIN]);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'Access denied: Authentication required',
    );
  });

  it('should throw ForbiddenException if user does not have required role', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleVo.ADMIN]);
    const context = createMockContext({
      id: '123',
      email: 'user@example.com',
      role: 'USER',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'Access denied: Insufficient permissions for this resource',
    );
  });

  it('should allow access if user has one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleVo.ADMIN, RoleVo.STAFF]);
    const context = createMockContext({
      id: '123',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access if user is attached to request.raw.user fallback', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleVo.SUPERADMIN]);
    const context = createMockContext(undefined, {
      id: '123',
      email: 'superadmin@example.com',
      role: 'SUPERADMIN',
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
