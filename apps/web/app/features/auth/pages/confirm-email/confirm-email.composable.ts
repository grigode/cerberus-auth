import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  ApiErrorCode,
  type ConfirmEmailResponseDto,
  type ResendConfirmEmailRequestDto,
  type ResendConfirmEmailResponseDto,
  type ApiErrorResponse,
} from '~/types/contracts';

export type ConfirmEmailStatus = 'verifying' | 'success' | 'expired' | 'error';

export const useConfirmEmail = () => {
  const route = useRoute();

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

    const { status: reqStatus } = await useAPI<ConfirmEmailResponseDto>(
      '/iam/confirm-email',
      {
        method: 'GET',
        query: { token: token.value },
        cache: 'no-cache',
        onResponseError({ response }) {
          const error = response._data as ApiErrorResponse | undefined;

          if (
            error?.code === ApiErrorCode.INVALID_CONFIRMATION_TOKEN ||
            error?.code === ApiErrorCode.CONFIRMATION_TOKEN_NOT_FOUND
          ) {
            status.value = 'expired';
          }
        },
      },
    );

    if (reqStatus.value === 'success') status.value = 'success';
    // Any failure not classified as expired above (network error, 5xx,
    // user not found/inactive) falls back to the generic error state.
    else if (status.value === 'verifying') status.value = 'error';
  };

  const resendSchema = z.object({
    email: z.email(tsR('inputs.email.error')),
  });

  type ResendSchema = z.output<typeof resendSchema>;

  const onResend = async (payload: FormSubmitEvent<ResendSchema>) => {
    resending.value = true;

    const requestBody: ResendConfirmEmailRequestDto = {
      email: payload.data.email,
    };

    const { status: reqStatus } = await useAPI<ResendConfirmEmailResponseDto>(
      '/iam/resend-confirm-email',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        cache: 'no-cache',
        onResponseError: ({ response }) => notifyApiError(response, tsE),
      },
    );

    if (reqStatus.value === 'success') {
      notifySuccess(tsR('success'), 'i-lucide-mail-check');
    }

    resending.value = false;
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
