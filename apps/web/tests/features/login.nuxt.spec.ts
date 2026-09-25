import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogin } from '../../app/features/auth/pages/login/login.composable';

const {
  mockLogin,
  mockResendConfirmEmail,
  mockRouterPush,
  mockFetchSession,
  mockNotifyApiError,
  mockNotifySuccess,
  mockRoute,
} = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockResendConfirmEmail: vi.fn(),
  mockRouterPush: vi.fn(),
  mockFetchSession: vi.fn(),
  mockNotifyApiError: vi.fn(),
  mockNotifySuccess: vi.fn(),
  mockRoute: { query: {} },
}));

mockNuxtImport('useAuthRepository', () => () => ({
  login: mockLogin,
  resendConfirmEmail: mockResendConfirmEmail,
}));
mockNuxtImport('useI18nShorter', () => () => ({
  t: (key: string) => key,
  ts: (key: string) => key,
}));
mockNuxtImport('useRouter', () => () => ({
  push: mockRouterPush,
  replace: vi.fn(),
  afterEach: vi.fn(),
  beforeResolve: vi.fn(),
}));
mockNuxtImport('useRoute', () => () => mockRoute);
mockNuxtImport('useAuth', () => () => ({
  fetchSession: mockFetchSession,
}));
mockNuxtImport('useAuthFeedback', () => () => ({
  notifyApiError: mockNotifyApiError,
  notifyError: vi.fn(),
  notifySuccess: mockNotifySuccess,
}));
mockNuxtImport('useGoogleAuth', () => () => ({
  redirecting: { value: false },
  loginWithGoogle: vi.fn(),
}));

describe('useLogin Composable & Schema Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate valid email and password format in schema', () => {
    const { schema } = useLogin();

    const validResult = schema.safeParse({
      email: 'test@example.com',
      password: 'StrongPassword123!',
    });
    expect(validResult.success).toBe(true);

    const invalidEmail = schema.safeParse({
      email: 'not-an-email',
      password: 'StrongPassword123!',
    });
    expect(invalidEmail.success).toBe(false);
  });

  it('should redirect to dashboard and fetch session on successful login', async () => {
    mockLogin.mockResolvedValueOnce({
      message: 'Logged in successfully',
    });

    const { onSubmit } = useLogin();
    await onSubmit({
      data: { email: 'alice@example.com', password: 'Password123!' },
    } as any);

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'Password123!',
    });
    expect(mockFetchSession).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to /auth/mfa when mfaRequired is returned', async () => {
    mockLogin.mockResolvedValueOnce({
      message: 'MFA required',
      mfaRequired: true,
      mfaToken: 'temp-mfa-jwt',
    });

    const { onSubmit } = useLogin();
    await onSubmit({
      data: { email: 'bob@example.com', password: 'Password123!' },
    } as any);

    expect(mockFetchSession).not.toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith({
      path: '/auth/mfa',
      query: { token: 'temp-mfa-jwt' },
    });
  });

  it('should show resend verification button when EMAIL_NOT_VERIFIED is returned', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Unverified'));
    mockNotifyApiError.mockReturnValueOnce('EMAIL_NOT_VERIFIED');

    const { onSubmit, showAskOtheConfirmTokenButton } = useLogin();
    await onSubmit({
      data: { email: 'unverified@example.com', password: 'Password123!' },
    } as any);

    expect(showAskOtheConfirmTokenButton.value).toBe(true);
  });

  it('should successfully resend confirmation email using remembered lastEmail', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Unverified'));
    mockNotifyApiError.mockReturnValueOnce('EMAIL_NOT_VERIFIED');

    const { onSubmit, resendConfirmation, showAskOtheConfirmTokenButton } =
      useLogin();
    await onSubmit({
      data: { email: 'unverified@example.com', password: 'Password123!' },
    } as any);

    mockResendConfirmEmail.mockResolvedValueOnce({
      message: 'Email sent',
    });

    await resendConfirmation();

    expect(mockResendConfirmEmail).toHaveBeenCalledWith({
      email: 'unverified@example.com',
    });
    expect(showAskOtheConfirmTokenButton.value).toBe(false);
  });
});
