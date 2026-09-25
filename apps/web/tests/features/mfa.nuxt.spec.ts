import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMfa } from '../../app/features/auth/pages/mfa/mfa.composable';

const {
  mockVerify,
  mockVerifyBackupCode,
  mockRouterPush,
  mockFetchSession,
  mockNotifyError,
  mockRoute,
} = vi.hoisted(() => ({
  mockVerify: vi.fn(),
  mockVerifyBackupCode: vi.fn(),
  mockRouterPush: vi.fn(),
  mockFetchSession: vi.fn(),
  mockNotifyError: vi.fn(),
  mockRoute: { query: { token: 'valid-mfa-token' } as Record<string, any> },
}));

mockNuxtImport('useMfaRepository', () => () => ({
  verify: mockVerify,
  verifyBackupCode: mockVerifyBackupCode,
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
  notifyError: mockNotifyError,
  notifyApiError: vi.fn(),
}));

describe('useMfa Composable (TOTP & Backup Codes)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = { token: 'valid-mfa-token' };
  });

  it('should redirect to /login if mfa challenge token is missing', async () => {
    mockRoute.query = {}; // No token

    const { onSubmit } = useMfa();
    await onSubmit();

    expect(mockNotifyError).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
    expect(mockVerify).not.toHaveBeenCalled();
    expect(mockVerifyBackupCode).not.toHaveBeenCalled();
  });

  it('should prevent submission when code is empty', async () => {
    const { onSubmit, code } = useMfa();
    code.value = '   ';

    await onSubmit();

    expect(mockNotifyError).toHaveBeenCalled();
    expect(mockVerify).not.toHaveBeenCalled();
    expect(mockVerifyBackupCode).not.toHaveBeenCalled();
  });

  it('should verify TOTP code and redirect to /dashboard on success', async () => {
    mockVerify.mockResolvedValueOnce({ message: 'Verified' });

    const { onSubmit, code } = useMfa();
    code.value = '123456';

    await onSubmit();

    expect(mockVerify).toHaveBeenCalledWith({
      mfaToken: 'valid-mfa-token',
      code: '123456',
    });
    expect(mockFetchSession).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should toggle between TOTP and backup code mode and use backup endpoint', async () => {
    mockVerifyBackupCode.mockResolvedValueOnce({ message: 'Verified' });

    const { onSubmit, toggleBackupCode, useBackupCode, code } = useMfa();
    toggleBackupCode();
    expect(useBackupCode.value).toBe(true);

    code.value = 'BACKUP-CODE-1';
    await onSubmit();

    expect(mockVerifyBackupCode).toHaveBeenCalledWith({
      mfaToken: 'valid-mfa-token',
      code: 'BACKUP-CODE-1',
    });
    expect(mockFetchSession).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });
});
