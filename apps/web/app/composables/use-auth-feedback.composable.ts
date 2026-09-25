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

  // Maps a failed response to a translated error toast and returns the backend
  // error code (or undefined). A 5xx — or any response without a mapped code —
  // shows the generic fallback; otherwise the per-code message. Returning the
  // code lets callers react to specific ones (e.g. EMAIL_NOT_VERIFIED).
  const notifyApiError = (
    response: { status: number; _data?: unknown },
    translate?: (key: string) => string,
  ): ApiErrorCode | string | undefined => {
    const error = response._data as ApiErrorResponse | undefined;

    if (response.status >= 500) {
      notifyError(
        translate
          ? translate('fallback')
          : 'An unexpected server error occurred.',
      );
      return undefined;
    }

    if (error?.code && translate) {
      const translated = translate(error.code);
      if (translated && translated !== error.code) {
        notifyError(translated);
        return error.code;
      }
    }

    if (typeof error?.message === 'string') {
      notifyError(error.message);
      return error.code;
    }

    if (Array.isArray(error?.message) && error.message.length > 0) {
      notifyError(error.message.join(', '));
      return error.code;
    }

    notifyError(translate ? translate('fallback') : 'An error occurred.');
    return error?.code;
  };

  return { notifyError, notifySuccess, notifyApiError };
};
