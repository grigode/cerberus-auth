import { useAuth } from '~/composables/use-auth.composable';
import { useAuthFeedback } from '~/composables/use-auth-feedback.composable';
import { useI18nShorter } from '~/composables/use-i18n-shorter.composable';

export const useMfa = () => {
  const route = useRoute();
  const router = useRouter();
  const { fetchSession } = useAuth();
  const { notifyApiError, notifyError } = useAuthFeedback();

  const { ts } = useI18nShorter('auth.mfa.form');
  const { ts: tsE } = useI18nShorter('auth.mfa.errors');

  const loading = ref(false);
  const useBackupCode = ref(false);
  const code = ref('');

  // Extract challenge token from query (?token=...)
  const mfaToken = computed(() => {
    const val = route.query.token;
    return (Array.isArray(val) ? val[0] : val) || '';
  });

  const toggleBackupCode = () => {
    useBackupCode.value = !useBackupCode.value;
    code.value = '';
  };

  const onSubmit = async () => {
    if (!mfaToken.value) {
      notifyError(tsE('missingToken'));
      await router.push('/login');
      return;
    }

    if (!code.value || code.value.trim().length === 0) {
      notifyError(
        useBackupCode.value
          ? ts('inputs.backupCode.error')
          : ts('inputs.code.error'),
      );
      return;
    }

    loading.value = true;

    const endpoint = useBackupCode.value
      ? '/iam/mfa/verify-backup-code'
      : '/iam/mfa/verify';

    const { status } = await useAPI(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        mfaToken: mfaToken.value,
        code: code.value.trim(),
      }),
      cache: 'no-cache',
      onResponseError: ({ response }) => notifyApiError(response, tsE),
    });

    if (status.value === 'success') {
      await fetchSession();
      await router.push('/dashboard');
    }

    loading.value = false;
  };

  return {
    loading,
    useBackupCode,
    code,
    mfaToken,
    toggleBackupCode,
    onSubmit,
  };
};
