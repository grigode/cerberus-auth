import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useResetPassword } from '../../app/features/auth/pages/reset-password/reset-password.composable';

const { mockResetPassword, mockNotifyError, mockRoute } = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
  mockNotifyError: vi.fn(),
  mockRoute: {
    query: { token: 'valid-reset-token' } as Record<string, any>,
  },
}));

mockNuxtImport('useAuthRepository', () => () => ({
  resetPassword: mockResetPassword,
}));
mockNuxtImport('useI18nShorter', () => () => ({
  t: (key: string) => key,
  ts: (key: string) => key,
}));
mockNuxtImport('useRoute', () => () => mockRoute);
mockNuxtImport('useAuthFeedback', () => () => ({
  notifyError: mockNotifyError,
}));

describe('useResetPassword Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = { token: 'valid-reset-token' };
  });

  it('should flag invalidToken when token is missing from route query', () => {
    mockRoute.query = {};
    const { invalidToken } = useResetPassword();
    expect(invalidToken.value).toBe(true);
  });

  it('should validate password complexity and confirmation match', () => {
    const { schema } = useResetPassword();

    const invalid = schema.safeParse({
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(invalid.success).toBe(false);

    const valid = schema.safeParse({
      password: 'SuperSecretPassword123!',
      confirmPassword: 'SuperSecretPassword123!',
    });
    expect(valid.success).toBe(true);
  });

  it('should call reset-password and set submitted to true on success', async () => {
    mockResetPassword.mockResolvedValueOnce({
      message: 'Password reset successful',
    });

    const { onSubmit, submitted } = useResetPassword();
    await onSubmit({
      data: {
        password: 'SuperSecretPassword123!',
        confirmPassword: 'SuperSecretPassword123!',
      },
    } as any);

    expect(mockResetPassword).toHaveBeenCalledWith({
      token: 'valid-reset-token',
      password: 'SuperSecretPassword123!',
    });
    expect(submitted.value).toBe(true);
  });

  it('should set invalidToken to true when server returns token expired or invalid', async () => {
    const errorWithCode = {
      data: { code: 'RESET_TOKEN_EXPIRED' },
    };
    mockResetPassword.mockRejectedValueOnce(errorWithCode);

    const { onSubmit, invalidToken } = useResetPassword();
    await onSubmit({
      data: {
        password: 'SuperSecretPassword123!',
        confirmPassword: 'SuperSecretPassword123!',
      },
    } as any);

    expect(invalidToken.value).toBe(true);
  });
});
