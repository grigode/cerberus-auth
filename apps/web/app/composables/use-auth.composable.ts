import type { SessionUser } from '~/types/session-user';
import {
  useAuthRepository,
  useProfileRepository,
} from './use-repositories.composable';

export const useAuth = () => {
  // useState keeps the authenticated user in Nuxt's shared, SSR-friendly
  // state so it survives across pages (and hydration) within a load.
  const user = useState<SessionUser | null>('auth.user', () => null);
  const isAuthenticated = computed(() => !!user.value);
  const authRepo = useAuthRepository();
  const profileRepo = useProfileRepository();

  const setUser = (value: SessionUser | null) => {
    user.value = value;
  };

  const clear = () => {
    user.value = null;
  };

  const refreshSession = async (): Promise<boolean> => {
    return authRepo.refreshToken();
  };

  // Restores authenticated state from the backend. The API client
  // automatically handles mutex silent token refresh if 401 occurs.
  const fetchSession = async () => {
    try {
      const data = await profileRepo.getProfile();
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
      await authRepo.logout();
    } finally {
      clear();
      await navigateTo('/login');
    }
  };

  // Revokes all sessions on all devices for the current user
  const logoutAll = async () => {
    try {
      await authRepo.logoutAll();
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
