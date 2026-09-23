import type { SessionUser } from '~/types/session-user';

export const useAuth = () => {
  // useState keeps the authenticated user in Nuxt's shared, SSR-friendly
  // state so it survives across pages (and hydration) within a load.
  const user = useState<SessionUser | null>('auth.user', () => null);
  const isAuthenticated = computed(() => !!user.value);

  const setUser = (value: SessionUser | null) => {
    user.value = value;
  };

  const clear = () => {
    user.value = null;
  };

  const refreshSession = async (): Promise<boolean> => {
    const config = useRuntimeConfig();
    try {
      await $fetch('/iam/refresh-token', {
        baseURL: config.public.apiBaseUrl,
        credentials: 'include',
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return true;
    } catch {
      return false;
    }
  };

  // Restores the authenticated state from the backend using the session
  // cookie. If expired, attempts a silent refresh before failing.
  //
  // Uses $fetch (not useAPI/useFetch) on purpose: this is an imperative,
  // on-demand call that must hit the backend every time (e.g. again right
  // after login). useFetch caches by key and would return the stale result.
  const fetchSession = async () => {
    const config = useRuntimeConfig();

    try {
      const data = await $fetch<SessionUser>('/iam/me', {
        baseURL: config.public.apiBaseUrl,
        credentials: 'include',
        method: 'GET',
      });

      setUser(data);
    } catch {
      const refreshed = await refreshSession();
      if (refreshed) {
        try {
          const data = await $fetch<SessionUser>('/iam/me', {
            baseURL: config.public.apiBaseUrl,
            credentials: 'include',
            method: 'GET',
          });
          setUser(data);
          return;
        } catch {
          // fall through to clear
        }
      }
      clear();
    }
  };

  // Ends the session: tells the backend to invalidate it, clears the local
  // state, and redirects to login. The server call is best-effort — even if
  // it fails we still clear locally so the user is logged out on this device.
  const logout = async () => {
    const config = useRuntimeConfig();

    try {
      await $fetch('/iam/logout', {
        baseURL: config.public.apiBaseUrl,
        credentials: 'include',
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } catch {
      // ignore — fall through to clearing local state regardless
    } finally {
      clear();
      await navigateTo('/login');
    }
  };

  // Revokes all sessions on all devices for the current user
  const logoutAll = async () => {
    const config = useRuntimeConfig();

    try {
      await $fetch('/iam/auth/logout-all', {
        baseURL: config.public.apiBaseUrl,
        credentials: 'include',
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } catch {
      // ignore
    } finally {
      clear();
      await navigateTo('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    setUser,
    clear,
    fetchSession,
    refreshSession,
    logout,
    logoutAll,
  };
};
