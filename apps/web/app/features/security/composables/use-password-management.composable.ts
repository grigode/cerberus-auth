import { useAuthRepository } from '~/composables/use-repositories.composable';

export const usePasswordManagement = () => {
  const authRepo = useAuthRepository();
  const { notifySuccess, notifyError } = useAuthFeedback();
  const { ts } = useI18nShorter('security.password');

  const currentPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const passwordLoading = ref(false);

  const onChangePassword = async () => {
    if (!currentPassword.value || !newPassword.value) {
      notifyError(ts('errors.empty'));
      return;
    }
    if (newPassword.value.length < 12) {
      notifyError(ts('errors.minLength'));
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      notifyError(ts('errors.mismatch'));
      return;
    }

    passwordLoading.value = true;
    try {
      await authRepo.changePassword({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      });

      notifySuccess(ts('success'));
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
    } catch {
      notifyError(ts('errors.failed'));
    } finally {
      passwordLoading.value = false;
    }
  };

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    passwordLoading,
    onChangePassword,
  };
};
