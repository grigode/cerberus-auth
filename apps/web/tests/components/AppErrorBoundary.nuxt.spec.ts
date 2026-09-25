import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from '../../app/components/AppErrorBoundary.vue';

describe('AppErrorBoundary Component', () => {
  it('should render fallback error message when error is provided', async () => {
    const mockClear = vi.fn();
    const wrapper = await mountSuspended(AppErrorBoundary, {
      props: {
        error: { message: 'Custom critical error occurred' },
        clearError: mockClear,
      },
    });

    expect(wrapper.text()).toContain('Something went wrong');
    expect(wrapper.text()).toContain('Custom critical error occurred');
  });

  it('should invoke clearError callback when clicking the retry button', async () => {
    const mockClear = vi.fn();
    const wrapper = await mountSuspended(AppErrorBoundary, {
      props: {
        error: { message: 'Temporary failure' },
        clearError: mockClear,
      },
    });

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    await button.trigger('click');

    expect(mockClear).toHaveBeenCalledTimes(1);
  });
});
