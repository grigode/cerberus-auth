import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';
import { useAuthRepository } from '~/composables/use-repositories.composable';
import { createEmailValidation } from '~/utils/validators';

export const useForgotPassword = () => {
  const loading = ref(false);
  const submitted = ref(false);
  const authRepo = useAuthRepository();

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
    email: createEmailValidation(ts('inputs.email.error')),
  });

  type Schema = z.output<typeof schema>;

  const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
    loading.value = true;

    try {
      await authRepo.forgotPassword({
        email: payload.data.email,
      });
      submitted.value = true;
    } catch (err: unknown) {
      notifyApiError(err, tsE);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    submitted,
    fields,
    schema,
    onSubmit,
  };
};
