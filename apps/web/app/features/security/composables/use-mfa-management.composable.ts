import type { MfaSetupResponseDto } from '~/types/contracts';
import { useMfaRepository } from '~/composables/use-repositories.composable';

export const useMfaManagement = () => {
  const mfaRepo = useMfaRepository();
  const { fetchSession } = useAuth();
  const { notifySuccess, notifyError } = useAuthFeedback();
  const { ts } = useI18nShorter('security.mfa');

  const isSetupModalOpen = ref(false);
  const isDisableModalOpen = ref(false);
  const isBackupCodesModalOpen = ref(false);

  const setupLoading = ref(false);
  const setupData = ref<MfaSetupResponseDto | null>(null);
  const verificationCode = ref('');
  const disableCode = ref('');
  const actionLoading = ref(false);

  const backupCodes = ref<string[]>([]);

  // Open setup modal and fetch QR + secret
  const openSetupMfa = async () => {
    setupLoading.value = true;
    setupData.value = null;
    verificationCode.value = '';
    isSetupModalOpen.value = true;

    try {
      setupData.value = await mfaRepo.setup();
    } catch {
      notifyError(ts('setup.error'));
      isSetupModalOpen.value = false;
    } finally {
      setupLoading.value = false;
    }
  };

  // Confirm and activate 2FA
  const confirmEnableMfa = async () => {
    if (!setupData.value || !verificationCode.value) return;
    actionLoading.value = true;

    try {
      await mfaRepo.enable({
        secret: setupData.value.secret,
        code: verificationCode.value.trim(),
      });

      notifySuccess(ts('setup.success'));
      isSetupModalOpen.value = false;
      await fetchSession();

      // Automatically generate backup codes upon first enable
      await regenerateBackupCodes(false);
    } catch {
      notifyError(ts('setup.error'));
    } finally {
      actionLoading.value = false;
    }
  };

  // Disable 2FA
  const confirmDisableMfa = async () => {
    if (!disableCode.value) return;
    actionLoading.value = true;

    try {
      await mfaRepo.disable({
        code: disableCode.value.trim(),
      });

      notifySuccess(ts('disable.success'));
      isDisableModalOpen.value = false;
      disableCode.value = '';
      await fetchSession();
    } catch {
      notifyError(ts('disable.error'));
    } finally {
      actionLoading.value = false;
    }
  };

  // Regenerate emergency backup codes
  const regenerateBackupCodes = async (notify = true) => {
    actionLoading.value = true;
    try {
      const res = await mfaRepo.regenerateBackupCodes();
      backupCodes.value = res.backupCodes || [];
      isBackupCodesModalOpen.value = true;
      if (notify) {
        notifySuccess(ts('backupCodes.regenerated'));
      }
    } catch {
      notifyError(ts('backupCodes.error'));
    } finally {
      actionLoading.value = false;
    }
  };

  const copySecret = () => {
    if (!setupData.value?.secret) return;
    navigator.clipboard.writeText(setupData.value.secret);
    notifySuccess(ts('setup.copiedSecret'));
  };

  const copyAllBackupCodes = () => {
    if (!backupCodes.value.length) return;
    navigator.clipboard.writeText(backupCodes.value.join('\n'));
    notifySuccess(ts('backupCodes.copied'));
  };

  return {
    isSetupModalOpen,
    isDisableModalOpen,
    isBackupCodesModalOpen,
    setupLoading,
    setupData,
    verificationCode,
    disableCode,
    actionLoading,
    backupCodes,
    openSetupMfa,
    confirmEnableMfa,
    confirmDisableMfa,
    regenerateBackupCodes,
    copySecret,
    copyAllBackupCodes,
  };
};
