import { useAuth } from '~/composables/use-auth.composable';
import { useAuthFeedback } from '~/composables/use-auth-feedback.composable';
import { useI18nShorter } from '~/composables/use-i18n-shorter.composable';
import { useMfaRepository } from '~/composables/use-repositories.composable';

export const useMfa = () => {
  const route = useRoute();
  const router = useRouter();
  const mfaRepo = useMfaRepository();
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

    try {
      if (useBackupCode.value) {
        await mfaRepo.verifyBackupCode({
          mfaToken: mfaToken.value,
          code: code.value.trim(),
        });
      } else {
        await mfaRepo.verify({
          mfaToken: mfaToken.value,
          code: code.value.trim(),
        });
      }

      await fetchSession();
      await router.push('/dashboard');
    } catch (err: unknown) {
      notifyApiError(err, tsE);
    } finally {
      loading.value = false;
    }
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
