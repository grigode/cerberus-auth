import type { ExecutionContext } from '@nestjs/common';

import { currentUserFactory } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  const mockUser = {
    id: '123',
    email: 'user@example.com',
    role: 'USER',
    isActive: true,
    isEmailVerified: true,
  };

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should return the full user object when no property data is passed', () => {
    const ctx = createMockContext(mockUser);
    const result = currentUserFactory(undefined, ctx);
    expect(result).toEqual(mockUser);
  });

  it('should return a specific property from user object when data parameter is provided', () => {
    const ctx = createMockContext(mockUser);
    const emailResult = currentUserFactory('email', ctx);
    const idResult = currentUserFactory('id', ctx);

    expect(emailResult).toBe('user@example.com');
    expect(idResult).toBe('123');
  });

  it('should return undefined if request has no user property', () => {
    const ctx = createMockContext(undefined);
    const result = currentUserFactory(undefined, ctx);
    expect(result).toBeUndefined();
  });
});
