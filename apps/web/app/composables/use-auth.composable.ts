import type { SessionUser } from '~/types/session-user';
import type { UserProfileResponseDto } from '~/types/api-contracts';
import { useApiClient } from './use-api';

export const useAuth = () => {
  // useState keeps the authenticated user in Nuxt's shared, SSR-friendly
  // state so it survives across pages (and hydration) within a load.
  const user = useState<SessionUser | null>('auth.user', () => null);
  const isAuthenticated = computed(() => !!user.value);
  const api = useApiClient();

  const setUser = (value: SessionUser | null) => {
    user.value = value;
  };

  const clear = () => {
    user.value = null;
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      await api('/iam/refresh-token', { method: 'POST' });
      return true;
    } catch {
      return false;
    }
  };

  // Restores authenticated state from the backend. The API client
  // automatically handles mutex silent token refresh if 401 occurs.
  const fetchSession = async () => {
    try {
      const data = await api<UserProfileResponseDto>('/iam/me', {
        method: 'GET',
      });
      setUser({
        id: data.id,
        email: data.email,
        firstName: data.profile?.firstName || '',
        lastName: data.profile?.lastName || '',
        role: data.role,
        isMfaEnabled: data.isMfaEnabled,
        avatarUrl: data.profile?.avatarUrl,
        language: data.profile?.language,
      });
    } catch {
      clear();
    }
  };

  // Ends the session: tells the backend to invalidate it, clears the local
  // state, and redirects to login.
  const logout = async () => {
    try {
      await api('/iam/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clear();
      await navigateTo('/login');
    }
  };

  // Revokes all sessions on all devices for the current user
  const logoutAll = async () => {
    try {
      await api('/iam/auth/logout-all', { method: 'POST' });
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
