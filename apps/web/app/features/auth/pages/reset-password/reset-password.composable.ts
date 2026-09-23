import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';
import type { ErrorResponse } from '~/types/error-response';

export const useResetPassword = () => {
  const route = useRoute();
  const loading = ref(false);
  const submitted = ref(false);

  const { ts } = useI18nShorter('auth.resetPassword.form');
  const { ts: tsE } = useI18nShorter('auth.resetPassword.errors');
  const { notifyError } = useAuthFeedback();

  const token = computed(() => {
    const value = route.query.token;
    return Array.isArray(value) ? value[0] : value;
  });

  // Evaluated during setup (route query is available on SSR too) so the
  // invalid-token view renders immediately without flashing the form.
  const invalidToken = ref(!token.value);

  const fields = computed<AuthFormField[]>(() => {
    return [
      {
        name: 'password',
        type: 'password',
        label: ts('inputs.password.label'),
        placeholder: ts('inputs.password.placeholder'),
        required: true,
      },
      {
        name: 'confirmPassword',
        type: 'password',
        label: ts('inputs.confirmPassword.label'),
        placeholder: ts('inputs.confirmPassword.placeholder'),
        required: true,
      },
    ];
  });

  const schema = z
    .object({
      password: z
        .string(ts('inputs.password.errors.minLength'))
        .min(12, ts('inputs.password.errors.minLength'))
        .regex(/[a-z]/, ts('inputs.password.errors.lowercase'))
        .regex(/[A-Z]/, ts('inputs.password.errors.uppercase'))
        .regex(/[0-9]/, ts('inputs.password.errors.number'))
        .regex(/[^A-Za-z0-9]/, ts('inputs.password.errors.symbol')),
      confirmPassword: z.string(ts('inputs.confirmPassword.error')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: ts('inputs.confirmPassword.error'),
      path: ['confirmPassword'],
    });

  type Schema = z.output<typeof schema>;

  const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
    if (!token.value) {
      invalidToken.value = true;
      return;
    }

    loading.value = true;

    const { status } = await useAPI('/iam/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: token.value,
        password: payload.data.password,
      }),
      cache: 'no-cache',
      onResponseError({ response }) {
        const error = response._data as ErrorResponse | undefined;

        if (
          error?.code === 'INVALID_RESET_TOKEN' ||
          error?.code === 'RESET_TOKEN_NOT_FOUND' ||
          error?.code === 'RESET_TOKEN_EXPIRED'
        ) {
          invalidToken.value = true;
          return;
        }

        // Any other failure (5xx, network, or an unmapped server code) shows
        // the generic message. Reset password has no per-code copy, so never
        // pass a raw code to the translator or it would render the key itself.
        notifyError(tsE('fallback'));
      },
    });

    if (status.value === 'success') submitted.value = true;
    loading.value = false;
  };

  return {
    loading,
    submitted,
    invalidToken,
    fields,
    schema,
    onSubmit,
  };
};
