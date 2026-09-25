import type { ApiClient } from '~/services/api/api-client';
import { createApiClient } from '~/services/api/api-client';

/**
 * Returns an instance of the intelligent API client ($api)
 * that supports silent refresh and SSR cookie forwarding.
 */
export const useApiClient = (): ApiClient => {
  const nuxtApp = useNuxtApp();
  const context = nuxtApp as unknown as { _apiClient?: ApiClient };
  if (!context._apiClient) {
    context._apiClient = createApiClient();
  }
  return context._apiClient;
};

/**
 * Declarative reactive useFetch wrapper with credentials, baseURL,
 * and silent refresh interceptor integrated.
 */
export function useAPI<T = unknown>(
  url: string | (() => string),
  options: Parameters<typeof useFetch<T>>[1] = {},
) {
  const config = useRuntimeConfig();
  const client = useApiClient();

  return useFetch<T>(url, {
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',
    $fetch: client as unknown as typeof $fetch,
    ...options,
  } as Parameters<typeof useFetch<T>>[1]);
}
