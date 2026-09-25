import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMfaManagement } from '../../app/features/security/composables/use-mfa-management.composable';
import { usePasswordManagement } from '../../app/features/security/composables/use-password-management.composable';

const {
  mockSetup,
  mockEnable,
  mockDisable,
  mockRegenerateBackupCodes,
  mockChangePassword,
  mockFetchSession,
  mockNotifySuccess,
  mockNotifyError,
} = vi.hoisted(() => ({
  mockSetup: vi.fn(),
  mockEnable: vi.fn(),
  mockDisable: vi.fn(),
  mockRegenerateBackupCodes: vi.fn(),
  mockChangePassword: vi.fn(),
  mockFetchSession: vi.fn(),
  mockNotifySuccess: vi.fn(),
  mockNotifyError: vi.fn(),
}));

mockNuxtImport('useMfaRepository', () => () => ({
  setup: mockSetup,
  enable: mockEnable,
  disable: mockDisable,
  regenerateBackupCodes: mockRegenerateBackupCodes,
}));

mockNuxtImport('useAuthRepository', () => () => ({
  changePassword: mockChangePassword,
}));

mockNuxtImport('useAuth', () => () => ({
  user: ref({ id: 'u1', isMfaEnabled: false }),
  fetchSession: mockFetchSession,
  logout: vi.fn(),
  logoutAll: vi.fn(),
}));

mockNuxtImport('useAuthFeedback', () => () => ({
  notifySuccess: mockNotifySuccess,
  notifyError: mockNotifyError,
}));

mockNuxtImport('useI18nShorter', () => () => ({
  t: (k: string) => k,
  ts: (k: string) => k,
}));

describe('Security Feature - useMfaManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with closed modals and empty state', () => {
    const { isSetupModalOpen, isDisableModalOpen, isBackupCodesModalOpen } =
      useMfaManagement();
    expect(isSetupModalOpen.value).toBe(false);
    expect(isDisableModalOpen.value).toBe(false);
    expect(isBackupCodesModalOpen.value).toBe(false);
  });

  it('openSetupMfa should fetch setup data and open modal', async () => {
    const mockData = {
      secret: 'SECRET123',
      qrCodeUrl: 'https://example.com/qr.png',
    };
    mockSetup.mockResolvedValueOnce(mockData);

    const { openSetupMfa, isSetupModalOpen, setupData, setupLoading } =
      useMfaManagement();
    await openSetupMfa();

    expect(mockSetup).toHaveBeenCalledTimes(1);
    expect(setupData.value).toEqual(mockData);
    expect(isSetupModalOpen.value).toBe(true);
    expect(setupLoading.value).toBe(false);
  });

  it('confirmEnableMfa should activate 2FA and refresh session', async () => {
    mockEnable.mockResolvedValueOnce({
      message: 'MFA enabled',
      backupCodes: ['code-1', 'code-2'],
    });
    mockRegenerateBackupCodes.mockResolvedValueOnce({
      backupCodes: ['code-1', 'code-2'],
    });

    const { confirmEnableMfa, setupData, verificationCode, isSetupModalOpen } =
      useMfaManagement();

    setupData.value = {
      secret: 'SECRET123',
      qrCodeUrl: 'https://example.com/qr.png',
    };
    verificationCode.value = '123456';
    isSetupModalOpen.value = true;

    await confirmEnableMfa();

    expect(mockEnable).toHaveBeenCalledWith({
      secret: 'SECRET123',
      code: '123456',
    });
    expect(mockNotifySuccess).toHaveBeenCalled();
    expect(mockFetchSession).toHaveBeenCalled();
    expect(isSetupModalOpen.value).toBe(false);
  });

  it('confirmDisableMfa should disable 2FA and clear code', async () => {
    mockDisable.mockResolvedValueOnce({ message: '2FA disabled' });

    const { confirmDisableMfa, disableCode, isDisableModalOpen } =
      useMfaManagement();

    disableCode.value = '654321';
    isDisableModalOpen.value = true;

    await confirmDisableMfa();

    expect(mockDisable).toHaveBeenCalledWith({ code: '654321' });
    expect(mockNotifySuccess).toHaveBeenCalled();
    expect(isDisableModalOpen.value).toBe(false);
    expect(disableCode.value).toBe('');
    expect(mockFetchSession).toHaveBeenCalled();
  });
});

describe('Security Feature - usePasswordManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate inputs before sending password change request', async () => {
    const { currentPassword, newPassword, confirmPassword, onChangePassword } =
      usePasswordManagement();

    // Empty fields
    await onChangePassword();
    expect(mockNotifyError).toHaveBeenCalled();
    expect(mockChangePassword).not.toHaveBeenCalled();

    // Password too short (< 12)
    currentPassword.value = 'old-password';
    newPassword.value = 'short';
    confirmPassword.value = 'short';
    await onChangePassword();
    expect(mockChangePassword).not.toHaveBeenCalled();

    // Mismatched passwords
    newPassword.value = 'SecurePassword123!';
    confirmPassword.value = 'MismatchPassword123!';
    await onChangePassword();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('should call changePassword and reset fields on success', async () => {
    mockChangePassword.mockResolvedValueOnce({ message: 'Password updated' });

    const { currentPassword, newPassword, confirmPassword, onChangePassword } =
      usePasswordManagement();

    currentPassword.value = 'OldPassword123!';
    newPassword.value = 'NewPassword123!';
    confirmPassword.value = 'NewPassword123!';

    await onChangePassword();

    expect(mockChangePassword).toHaveBeenCalledWith({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    });
    expect(mockNotifySuccess).toHaveBeenCalled();
    expect(currentPassword.value).toBe('');
    expect(newPassword.value).toBe('');
    expect(confirmPassword.value).toBe('');
  });
});
