import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { ApiErrorCode, type ApiErrorResponse } from '~/types/contracts';
import { useAuthRepository } from '~/composables/use-repositories.composable';
import { createEmailValidation } from '~/utils/validators';

export type ConfirmEmailStatus = 'verifying' | 'success' | 'expired' | 'error';

export const useConfirmEmail = () => {
  const route = useRoute();
  const authRepo = useAuthRepository();

  const { ts: tsR } = useI18nShorter('auth.confirmEmail.resend');
  const { ts: tsE } = useI18nShorter('auth.confirmEmail.errors');
  const { notifyApiError, notifySuccess } = useAuthFeedback();

  const status = ref<ConfirmEmailStatus>('verifying');
  const resending = ref(false);
  const resendState = reactive({ email: '' });

  const token = computed(() => {
    const value = route.query.token;
    return Array.isArray(value) ? value[0] : value;
  });

  const verify = async () => {
    if (!token.value) {
      status.value = 'error';
      return;
    }

    status.value = 'verifying';

    try {
      await authRepo.confirmEmail(token.value);
      status.value = 'success';
    } catch (error: unknown) {
      const err = error as {
        data?: ApiErrorResponse;
        response?: { _data?: ApiErrorResponse };
      };
      const errorData = err?.response?._data || err?.data;

      if (
        errorData?.code === ApiErrorCode.INVALID_CONFIRMATION_TOKEN ||
        errorData?.code === ApiErrorCode.CONFIRMATION_TOKEN_NOT_FOUND
      ) {
        status.value = 'expired';
      } else {
        status.value = 'error';
      }
    }
  };

  const resendSchema = z.object({
    email: createEmailValidation(tsR('inputs.email.error')),
  });

  type ResendSchema = z.output<typeof resendSchema>;

  const onResend = async (payload: FormSubmitEvent<ResendSchema>) => {
    resending.value = true;

    try {
      await authRepo.resendConfirmEmail({
        email: payload.data.email,
      });
      notifySuccess(tsR('success'), 'i-lucide-mail-check');
    } catch (err: unknown) {
      notifyApiError(err, tsE);
    } finally {
      resending.value = false;
    }
  };

  onMounted(verify);

  return {
    status,
    resending,
    resendState,
    resendSchema,
    onResend,
  };
};
