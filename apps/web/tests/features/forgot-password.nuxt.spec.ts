import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useForgotPassword } from '../../app/features/auth/pages/forgot-password/forgot-password.composable';

const { mockForgotPassword } = vi.hoisted(() => ({
  mockForgotPassword: vi.fn(),
}));

mockNuxtImport('useAuthRepository', () => () => ({
  forgotPassword: mockForgotPassword,
}));
mockNuxtImport('useI18nShorter', () => () => ({
  t: (key: string) => key,
  ts: (key: string) => key,
}));
mockNuxtImport('useAuthFeedback', () => () => ({
  notifyApiError: vi.fn(),
}));

describe('useForgotPassword Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate email field in schema', () => {
    const { schema } = useForgotPassword();

    expect(schema.safeParse({ email: 'valid@example.com' }).success).toBe(true);
    expect(schema.safeParse({ email: 'invalid-email' }).success).toBe(false);
  });

  it('should call forgot-password endpoint and set submitted state on success', async () => {
    mockForgotPassword.mockResolvedValueOnce({
      message: 'Reset link sent',
    });

    const { onSubmit, submitted } = useForgotPassword();
    expect(submitted.value).toBe(false);

    await onSubmit({
      data: { email: 'user@example.com' },
    } as any);

    expect(mockForgotPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
    expect(submitted.value).toBe(true);
  });
});
