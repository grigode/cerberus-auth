import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import { useAuthFeedback } from '../../app/composables/use-auth-feedback.composable';

const { mockAddToast } = vi.hoisted(() => ({
  mockAddToast: vi.fn(),
}));

mockNuxtImport('useToast', () => () => ({
  add: mockAddToast,
}));

describe('useAuthFeedback composable', () => {
  it('should trigger success toast with correct structure', () => {
    const { notifySuccess } = useAuthFeedback();
    notifySuccess('Operation succeeded');

    expect(mockAddToast).toHaveBeenCalledWith({
      description: 'Operation succeeded',
      color: 'success',
      icon: 'i-lucide-circle-check-big',
    });
  });

  it('should trigger error toast with correct structure', () => {
    const { notifyError } = useAuthFeedback();
    notifyError('Something went wrong');

    expect(mockAddToast).toHaveBeenCalledWith({
      description: 'Something went wrong',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    });
  });

  it('should handle 5xx server error with fallback message', () => {
    const { notifyApiError } = useAuthFeedback();
    const result = notifyApiError({ status: 500 });

    expect(result).toBeUndefined();
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'An unexpected server error occurred.',
        color: 'error',
      }),
    );
  });

  it('should translate known backend error code if translator is provided', () => {
    const { notifyApiError } = useAuthFeedback();
    const translator = (code: string) => {
      if (code === 'INVALID_CREDENTIALS') return 'Credenciales incorrectas';
      return code;
    };

    const result = notifyApiError(
      {
        status: 400,
        _data: { code: 'INVALID_CREDENTIALS', message: 'Bad request' },
      },
      translator,
    );

    expect(result).toBe('INVALID_CREDENTIALS');
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Credenciales incorrectas',
        color: 'error',
      }),
    );
  });
});
