import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

export const useForgotPassword = () => {
  const loading = ref(false);
  const submitted = ref(false);

  const { ts } = useI18nShorter('auth.forgotPassword.form');
  const { ts: tsE } = useI18nShorter('auth.forgotPassword.errors');
  const { notifyApiError } = useAuthFeedback();

  const fields = computed<AuthFormField[]>(() => {
    return [
      {
        name: 'email',
        type: 'email',
        label: ts('inputs.email.label'),
        placeholder: ts('inputs.email.placeholder'),
        required: true,
      },
    ];
  });

  const schema = z.object({
    email: z.email(ts('inputs.email.error')),
  });

  type Schema = z.output<typeof schema>;

  const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
    loading.value = true;

    const { status } = await useAPI('/iam/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: payload.data.email }),
      cache: 'no-cache',
      onResponseError: ({ response }) => notifyApiError(response, tsE),
    });

    if (status.value === 'success') submitted.value = true;
    loading.value = false;
  };

  return {
    loading,
    submitted,
    fields,
    schema,
    onSubmit,
  };
};
