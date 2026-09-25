import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import ErrorPage from '../../app/error.vue';

describe('Root Error Page (error.vue)', () => {
  it('should render 404 page with appropriate title and description', async () => {
    const error404 = {
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Page not found',
    };

    const wrapper = await mountSuspended(ErrorPage, {
      props: {
        error: error404 as any,
      },
    });

    expect(wrapper.text()).toContain('404');
    expect(wrapper.text()).toContain('Page Not Found');
    expect(wrapper.text()).toContain('Return to Safety');
  });

  it('should render 500 error page with error message', async () => {
    const error500 = {
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Database connection failed',
    };

    const wrapper = await mountSuspended(ErrorPage, {
      props: {
        error: error500 as any,
      },
    });

    expect(wrapper.text()).toContain('500');
    expect(wrapper.text()).toContain('Something Went Wrong');
    expect(wrapper.text()).toContain('Database connection failed');
  });
});
