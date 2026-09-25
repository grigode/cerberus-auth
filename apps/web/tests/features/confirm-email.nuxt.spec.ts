import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useConfirmEmail } from '../../app/features/auth/pages/confirm-email/confirm-email.composable';

const {
  mockConfirmEmail,
  mockResendConfirmEmail,
  mockUseRoute,
  mockNotifySuccess,
} = vi.hoisted(() => ({
  mockConfirmEmail: vi.fn(),
  mockResendConfirmEmail: vi.fn(),
  mockUseRoute: vi.fn(() => ({
    query: { token: 'valid-test-token' },
  })),
  mockNotifySuccess: vi.fn(),
}));

mockNuxtImport('useAuthRepository', () => () => ({
  confirmEmail: mockConfirmEmail,
  resendConfirmEmail: mockResendConfirmEmail,
}));
mockNuxtImport('useRoute', () => mockUseRoute);
mockNuxtImport('useI18nShorter', () => () => ({
  t: (key: string) => key,
  ts: (key: string) => key,
}));
mockNuxtImport('useAuthFeedback', () => () => ({
  notifyApiError: vi.fn(),
  notifySuccess: mockNotifySuccess,
}));

describe('useConfirmEmail Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate email in resend schema', () => {
    const { resendSchema } = useConfirmEmail();

    expect(resendSchema.safeParse({ email: 'user@example.com' }).success).toBe(
      true,
    );
    expect(resendSchema.safeParse({ email: 'invalid-email' }).success).toBe(
      false,
    );
  });

  it('should call resend endpoint on resend submit', async () => {
    mockResendConfirmEmail.mockResolvedValueOnce({ message: 'Success' });

    const { onResend, resending } = useConfirmEmail();
    expect(resending.value).toBe(false);

    const submitEvent = {
      data: { email: 'user@example.com' },
    } as unknown as FormSubmitEvent<{ email: string }>;

    await onResend(submitEvent);

    expect(mockResendConfirmEmail).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
    expect(mockNotifySuccess).toHaveBeenCalled();
    expect(resending.value).toBe(false);
  });
});
