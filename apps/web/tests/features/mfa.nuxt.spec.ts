import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMfa } from '../../app/features/auth/pages/mfa/mfa.composable';

const {
  mockUseAPI,
  mockRouterPush,
  mockFetchSession,
  mockNotifyError,
  mockRoute,
} = vi.hoisted(() => ({
  mockUseAPI: vi.fn(),
  mockRouterPush: vi.fn(),
  mockFetchSession: vi.fn(),
  mockNotifyError: vi.fn(),
  mockRoute: { query: { token: 'valid-mfa-token' } as Record<string, any> },
}));

mockNuxtImport('useAPI', () => mockUseAPI);
mockNuxtImport('useI18nShorter', () => () => ({
  t: (key: string) => key,
  ts: (key: string) => key,
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
  let mockRouterPush: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = { token: 'valid-mfa-token' };
    mockRouterPush = vi
      .spyOn(useRouter(), 'push')
      .mockResolvedValue(undefined as any);
  });

  it('should redirect to /login if mfa challenge token is missing', async () => {
    mockRoute.query = {}; // No token

    const { onSubmit } = useMfa();
    await onSubmit();

    expect(mockNotifyError).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
    expect(mockUseAPI).not.toHaveBeenCalled();
  });

  it('should prevent submission when code is empty', async () => {
    const { onSubmit, code } = useMfa();
    code.value = '   ';

    await onSubmit();

    expect(mockNotifyError).toHaveBeenCalled();
    expect(mockUseAPI).not.toHaveBeenCalled();
  });

  it('should verify TOTP code and redirect to /dashboard on success', async () => {
    mockUseAPI.mockResolvedValueOnce({
      status: { value: 'success' },
    });

    const { onSubmit, code } = useMfa();
    code.value = '123456';

    await onSubmit();

    expect(mockUseAPI).toHaveBeenCalledWith(
      '/iam/mfa/verify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          mfaToken: 'valid-mfa-token',
          code: '123456',
        }),
      }),
    );
    expect(mockFetchSession).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should toggle between TOTP and backup code mode and use backup endpoint', async () => {
    mockUseAPI.mockResolvedValueOnce({
      status: { value: 'success' },
    });

    const { onSubmit, toggleBackupCode, useBackupCode, code } = useMfa();
    toggleBackupCode();
    expect(useBackupCode.value).toBe(true);

    code.value = 'BACKUP-CODE-1';
    await onSubmit();

    expect(mockUseAPI).toHaveBeenCalledWith(
      '/iam/mfa/verify-backup-code',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          mfaToken: 'valid-mfa-token',
          code: 'BACKUP-CODE-1',
        }),
      }),
    );
    expect(mockFetchSession).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });
});
