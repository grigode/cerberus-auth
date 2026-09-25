import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogin } from '../../app/features/auth/pages/login/login.composable';

const {
  mockUseAPI,
  mockRouterPush,
  mockFetchSession,
  mockNotifyApiError,
  mockNotifySuccess,
  mockRoute,
} = vi.hoisted(() => ({
  mockUseAPI: vi.fn(),
  mockRouterPush: vi.fn(),
  mockFetchSession: vi.fn(),
  mockNotifyApiError: vi.fn(),
  mockNotifySuccess: vi.fn(),
  mockRoute: { query: {} },
}));

mockNuxtImport('useAPI', () => mockUseAPI);
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
    mockUseAPI.mockResolvedValueOnce({
      status: { value: 'success' },
      data: { value: { message: 'Logged in successfully' } },
    });

    const { onSubmit } = useLogin();
    await onSubmit({
      data: { email: 'alice@example.com', password: 'Password123!' },
    } as any);

    expect(mockUseAPI).toHaveBeenCalledWith(
      '/iam/login',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(mockFetchSession).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to /auth/mfa when mfaRequired is returned', async () => {
    mockUseAPI.mockResolvedValueOnce({
      status: { value: 'success' },
      data: {
        value: {
          message: 'MFA required',
          mfaRequired: true,
          mfaToken: 'temp-mfa-jwt',
        },
      },
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
    mockUseAPI.mockImplementationOnce(
      async (_url: string, opts: { onResponseError: (ctx: any) => void }) => {
        mockNotifyApiError.mockReturnValueOnce('EMAIL_NOT_VERIFIED');
        opts.onResponseError({ response: { status: 403 } });
        return {
          status: { value: 'error' },
          data: { value: null },
        };
      },
    );

    const { onSubmit, showAskOtheConfirmTokenButton } = useLogin();
    await onSubmit({
      data: { email: 'unverified@example.com', password: 'Password123!' },
    } as any);

    expect(showAskOtheConfirmTokenButton.value).toBe(true);
  });

  it('should successfully resend confirmation email using remembered lastEmail', async () => {
    // First simulate failed login to remember lastEmail
    mockUseAPI.mockImplementationOnce(
      async (_url: string, opts: { onResponseError: (ctx: any) => void }) => {
        mockNotifyApiError.mockReturnValueOnce('EMAIL_NOT_VERIFIED');
        opts.onResponseError({ response: { status: 403 } });
        return { status: { value: 'error' }, data: { value: null } };
      },
    );

    const { onSubmit, resendConfirmation, showAskOtheConfirmTokenButton } =
      useLogin();
    await onSubmit({
      data: { email: 'unverified@example.com', password: 'Password123!' },
    } as any);

    mockUseAPI.mockResolvedValueOnce({
      status: { value: 'success' },
    });

    await resendConfirmation();

    expect(mockUseAPI).toHaveBeenLastCalledWith(
      '/iam/resend-confirm-email',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'unverified@example.com' }),
      }),
    );
    expect(showAskOtheConfirmTokenButton.value).toBe(false);
  });
});
