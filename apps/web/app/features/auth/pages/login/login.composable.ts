import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

export const useLogin = () => {
  const route = useRoute();
  const router = useRouter();
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
    email: z.email(ts('inputs.email.error')),
    password: z.string(ts('inputs.password.error')),
  });

  type Schema = z.output<typeof schema>;

  const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
    showAskOtheConfirmTokenButton.value = false;
    lastEmail.value = payload.data.email;
    loading.value = true;

    interface LoginResponse {
      message: string;
      mfaRequired?: boolean;
      mfaToken?: string;
    }

    const { status, data } = await useAPI<LoginResponse>('/iam/login', {
      method: 'POST',
      body: JSON.stringify(payload.data),
      cache: 'no-cache',
      onResponseError({ response }) {
        const code = notifyApiError(response, tsE);

        if (code === 'EMAIL_NOT_VERIFIED')
          showAskOtheConfirmTokenButton.value = true;
      },
    });

    if (status.value === 'success') {
      if (data.value?.mfaRequired && data.value?.mfaToken) {
        await router.push({
          path: '/auth/mfa',
          query: { token: data.value.mfaToken },
        });
        loading.value = false;
        return;
      }

      // Populate the authenticated state right away so /dashboard has the
      // user without waiting for a refresh to re-run the session plugin.
      await fetchSession();
      router.push('/dashboard');
    }
    loading.value = false;
  };

  // Resends the confirmation email for the address the user just tried to log
  // in with. Surfaced only after an EMAIL_NOT_VERIFIED error, so lastEmail is
  // always set by the time this runs.
  const resendConfirmation = async () => {
    if (!lastEmail.value) return;

    resendingConfirmation.value = true;

    const { status } = await useAPI('/iam/resend-confirm-email', {
      method: 'POST',
      body: JSON.stringify({ email: lastEmail.value }),
      cache: 'no-cache',
      onResponseError: ({ response }) => notifyApiError(response, tsE),
    });

    if (status.value === 'success') {
      notifySuccess(tsR('success'), 'i-lucide-mail-check');
      showAskOtheConfirmTokenButton.value = false;
    }

    resendingConfirmation.value = false;
  };

  // The backend redirects failed/cancelled Google logins back to
  // /login?error=<code>. Surface it as a toast and strip the query so it
  // doesn't re-trigger on refresh.
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
