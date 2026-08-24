import { sanitizeData } from './sanitizer.util';

describe('sanitizeData', () => {
  it('should return null or undefined as is', () => {
    expect(sanitizeData(null)).toBeNull();
    expect(sanitizeData(undefined)).toBeUndefined();
  });

  it('should mask sensitive keys recursively', () => {
    const raw = {
      user: {
        email: 'test@example.com',
        password: 'SuperSecretPassword123!',
        token: 'jwt-access-token-xyz',
      },
      meta: {
        authorization: 'Bearer token',
        creditCard: '4111111111111111',
      },
    };

    const sanitized = sanitizeData(raw);

    expect(sanitized.user.email).toBe('test@example.com');
    expect(sanitized.user.password).toBe('***MASKED***');
    expect(sanitized.user.token).toBe('***MASKED***');
    expect(sanitized.meta.authorization).toBe('***MASKED***');
    expect(sanitized.meta.creditCard).toBe('***MASKED***');
  });

  it('should preserve non-sensitive fields and arrays', () => {
    const raw = {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, secret: 'shh' },
      ],
    };

    const sanitized = sanitizeData(raw);

    expect(sanitized.items[0].name).toBe('Item 1');
    expect(sanitized.items[1].secret).toBe('***MASKED***');
  });
});
