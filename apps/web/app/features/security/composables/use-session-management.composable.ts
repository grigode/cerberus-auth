export const useSessionManagement = () => {
  const { logoutAll } = useAuth();
  const { notifySuccess, notifyError } = useAuthFeedback();
  const { ts } = useI18nShorter('security.sessions');

  const revokingSessions = ref(false);

  const onRevokeOtherSessions = async () => {
    revokingSessions.value = true;
    try {
      await logoutAll();
      notifySuccess(ts('revokeSuccess'));
    } catch {
      notifyError(ts('revokeError'));
    } finally {
      revokingSessions.value = false;
    }
  };

  return {
    revokingSessions,
    onRevokeOtherSessions,
  };
};
