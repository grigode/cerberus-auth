import type { ApiErrorResponse, ApiErrorCode } from '~/types/api-contracts';

// Centralizes the auth feedback toasts so every flow reports errors and
// successes the same way — same colors and icons, and the same rule for
// turning a failed response into a message.
export const useAuthFeedback = () => {
  const toast = useToast();

  const notifyError = (description: string) =>
    toast.add({
      description,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    });

  const notifySuccess = (
    description: string,
    icon = 'i-lucide-circle-check-big',
  ) =>
    toast.add({
      description,
      color: 'success',
      icon,
    });

  // Maps a failed response or thrown FetchError to a translated error toast and returns
  // the backend error code (or undefined). A 5xx — or any response without a mapped code —
  // shows the generic fallback; otherwise the per-code message.
  const notifyApiError = (
    errorOrResponse: unknown,
    translate?: (key: string) => string,
  ): ApiErrorCode | string | undefined => {
    const err = errorOrResponse as {
      status?: number;
      statusCode?: number;
      data?: unknown;
      response?: { status: number; _data?: unknown };
      _data?: unknown;
    };

    const status =
      err?.response?.status || err?.status || err?.statusCode || 500;
    const errorData = (err?.response?._data || err?.data || err?._data) as
      | ApiErrorResponse
      | undefined;

    if (status >= 500) {
      notifyError(
        translate
          ? translate('fallback')
          : 'An unexpected server error occurred.',
      );
      return undefined;
    }

    if (errorData?.code && translate) {
      const translated = translate(errorData.code);
      if (translated && translated !== errorData.code) {
        notifyError(translated);
        return errorData.code;
      }
    }

    if (typeof errorData?.message === 'string') {
      notifyError(errorData.message);
      return errorData.code;
    }

    if (Array.isArray(errorData?.message) && errorData.message.length > 0) {
      notifyError(errorData.message.join(', '));
      return errorData.code;
    }

    notifyError(translate ? translate('fallback') : 'An error occurred.');
    return errorData?.code;
  };

  return { notifyError, notifySuccess, notifyApiError };
};
