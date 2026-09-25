import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';
import { ApiErrorCode, type ApiErrorResponse } from '~/types/contracts';
import { useAuthRepository } from '~/composables/use-repositories.composable';
import { createPasswordValidation } from '~/utils/validators';

export const useResetPassword = () => {
  const route = useRoute();
  const authRepo = useAuthRepository();
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
      password: createPasswordValidation({
        minLength: ts('inputs.password.errors.minLength'),
        lowercase: ts('inputs.password.errors.lowercase'),
        uppercase: ts('inputs.password.errors.uppercase'),
        number: ts('inputs.password.errors.number'),
        symbol: ts('inputs.password.errors.symbol'),
      }),
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

    try {
      await authRepo.resetPassword({
        token: token.value,
        password: payload.data.password,
      });
      submitted.value = true;
    } catch (error: unknown) {
      const err = error as {
        data?: ApiErrorResponse;
        response?: { _data?: ApiErrorResponse };
      };
      const errorData = err?.response?._data || err?.data;

      if (
        errorData?.code === ApiErrorCode.INVALID_RESET_TOKEN ||
        errorData?.code === ApiErrorCode.RESET_TOKEN_NOT_FOUND ||
        errorData?.code === ApiErrorCode.RESET_TOKEN_EXPIRED
      ) {
        invalidToken.value = true;
        return;
      }

      notifyError(tsE('fallback'));
    } finally {
      loading.value = false;
    }
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
