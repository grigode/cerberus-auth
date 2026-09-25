import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';
import { ApiErrorCode } from '~/types/contracts';
import { useAuthRepository } from '~/composables/use-repositories.composable';
import { createEmailValidation } from '~/utils/validators';

export const useLogin = () => {
  const route = useRoute();
  const router = useRouter();
  const authRepo = useAuthRepository();
  const showAskOtheConfirmTokenButton = ref(false);
  const resendingConfirmation = ref(false);
  const loading = ref(false);

  // Remembers the last submitted email so the "resend verification link"
  // action (shown after an EMAIL_NOT_VERIFIED error) knows where to send it.
  const lastEmail = ref('');

  const { ts } = useI18nShorter('auth.login.form');
  const { ts: tsE } = useI18nShorter('auth.login.errors');
  const { ts: tsR } = useI18nShorter('auth.login.resend');
  const { fetchSession } = useAuth();
  const { ts: tsO } = useI18nShorter('auth.login.oauth');
  const { notifyApiError, notifyError, notifySuccess } = useAuthFeedback();
  const { redirecting, loginWithGoogle } = useGoogleAuth();

  const fields = computed<AuthFormField[]>(() => {
    return [
      {
        name: 'email',
        type: 'email',
        label: ts('inputs.email.label'),
        placeholder: ts('inputs.email.placeholder'),
        required: true,
      },
      {
        name: 'password',
        type: 'password',
        label: ts('inputs.password.label'),
        placeholder: ts('inputs.password.placeholder'),
        required: true,
      },
    ];
  });

  const providers = computed(() => [
    {
      label: ts('providers.google'),
      icon: 'i-simple-icons-google',
      onClick: loginWithGoogle,
      loading: redirecting.value,
      class: 'cursor-pointer',
    },
  ]);

  const schema = z.object({
    email: createEmailValidation(ts('inputs.email.error')),
    password: z.string(ts('inputs.password.error')),
  });

  type Schema = z.output<typeof schema>;

  const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
    showAskOtheConfirmTokenButton.value = false;
    lastEmail.value = payload.data.email;
    loading.value = true;

    try {
      const data = await authRepo.login(payload.data);

      if (data?.mfaRequired && data?.mfaToken) {
        await router.push({
          path: '/auth/mfa',
          query: { token: data.mfaToken },
        });
        loading.value = false;
        return;
      }

      // Populate authenticated state immediately
      await fetchSession();
      router.push('/dashboard');
    } catch (err: unknown) {
      const code = notifyApiError(err, tsE);

      if (code === ApiErrorCode.EMAIL_NOT_VERIFIED) {
        showAskOtheConfirmTokenButton.value = true;
      }
    } finally {
      loading.value = false;
    }
  };

  // Resends the confirmation email for the address the user just tried to log in with
  const resendConfirmation = async () => {
    if (!lastEmail.value) return;

    resendingConfirmation.value = true;

    try {
      await authRepo.resendConfirmEmail({ email: lastEmail.value });
      notifySuccess(tsR('success'), 'i-lucide-mail-check');
      showAskOtheConfirmTokenButton.value = false;
    } catch (err: unknown) {
      notifyApiError(err, tsE);
    } finally {
      resendingConfirmation.value = false;
    }
  };

  // Handles Google OAuth errors surfaced via /login?error=<code>
  const handleOAuthError = () => {
    const value = route.query.error;
    const code = Array.isArray(value) ? value[0] : value;
    if (!code) return;

    notifyError(code === 'access_denied' ? tsO('cancelled') : tsO('failed'));
    router.replace({ query: {} });
  };

  onMounted(handleOAuthError);

  return {
    loading,
    fields,
    showAskOtheConfirmTokenButton,
    resendingConfirmation,
    resendConfirmation,
    providers,
    schema,
    onSubmit,
  };
};
