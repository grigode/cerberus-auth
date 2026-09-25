import { appendResponseHeader, splitCookiesString } from 'h3';
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';

let refreshPromise: Promise<boolean> | null = null;

export type ApiClient = <T = unknown>(
  request: string,
  opts?: NitroFetchOptions<NitroFetchRequest>,
) => Promise<T>;

/**
 * Creates an intelligent HTTP client with:
 * 1. Automatic cookie forwarding in SSR (both request and Set-Cookie response)
 * 2. Mutex-protected silent token refresh queue on 401 Unauthorized
 * 3. Prevention of token-rotation race conditions
 */
export const createApiClient = (): ApiClient => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;

  const performSilentRefresh = async (): Promise<boolean> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const fetchHeaders: Record<string, string> = {
          'X-Requested-With': 'XMLHttpRequest',
        };

        if (import.meta.server) {
          const reqHeaders = useRequestHeaders(['cookie']);
          if (reqHeaders.cookie) {
            fetchHeaders.cookie = reqHeaders.cookie;
          }
        }

        const res = await $fetch.raw('/iam/refresh-token', {
          baseURL,
          method: 'POST',
          credentials: 'include',
          headers: fetchHeaders,
        });

        // Forward set-cookie to browser if running in SSR
        if (import.meta.server && res.headers.has('set-cookie')) {
          const event = useRequestEvent();
          if (event) {
            const rawSetCookie = res.headers.get('set-cookie') || '';
            const cookies = splitCookiesString(rawSetCookie);
            for (const cookie of cookies) {
              appendResponseHeader(event, 'set-cookie', cookie);
            }
          }
        }

        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  const client = async <T = unknown>(
    request: string,
    opts: NitroFetchOptions<NitroFetchRequest> = {},
  ): Promise<T> => {
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...((opts.headers as Record<string, string>) || {}),
    };

    if (import.meta.server) {
      const reqHeaders = useRequestHeaders(['cookie']);
      if (reqHeaders.cookie && !fetchHeaders.cookie) {
        fetchHeaders.cookie = reqHeaders.cookie;
      }
    }

    const mergedOpts = {
      baseURL,
      credentials: 'include' as const,
      ...opts,
      headers: fetchHeaders,
    };

    try {
      const res = await $fetch.raw<T>(request, mergedOpts);

      if (import.meta.server && res.headers.has('set-cookie')) {
        const event = useRequestEvent();
        if (event) {
          const rawSetCookie = res.headers.get('set-cookie') || '';
          const cookies = splitCookiesString(rawSetCookie);
          for (const cookie of cookies) {
            appendResponseHeader(event, 'set-cookie', cookie);
          }
        }
      }

      return res._data as T;
    } catch (error: unknown) {
      const err = error as { status?: number; statusCode?: number };
      const isUnauthorized = err?.status === 401 || err?.statusCode === 401;
      const isBypassedEndpoint =
        request.includes('/iam/refresh-token') ||
        request.includes('/iam/login') ||
        request.includes('/iam/register') ||
        request.includes('/iam/auth/reset-password') ||
        request.includes('/iam/auth/forgot-password');

      if (isUnauthorized && !isBypassedEndpoint) {
        const refreshed = await performSilentRefresh();
        if (refreshed) {
          if (import.meta.server) {
            const reqHeaders = useRequestHeaders(['cookie']);
            if (reqHeaders.cookie) {
              fetchHeaders.cookie = reqHeaders.cookie;
            }
          }

          const retryRes = await $fetch.raw<T>(request, {
            ...mergedOpts,
            headers: fetchHeaders,
          });

          if (import.meta.server && retryRes.headers.has('set-cookie')) {
            const event = useRequestEvent();
            if (event) {
              const rawSetCookie = retryRes.headers.get('set-cookie') || '';
              const cookies = splitCookiesString(rawSetCookie);
              for (const cookie of cookies) {
                appendResponseHeader(event, 'set-cookie', cookie);
              }
            }
          }

          return retryRes._data as T;
        }
      }

      throw error;
    }
  };

  return client;
};
