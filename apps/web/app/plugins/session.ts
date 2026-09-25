import { useAuth } from '~/composables/use-auth.composable';

/**
 * Universal session restoration plugin (SSR + Client).
 * Restores user state during SSR if session cookies exist so the page renders
 * with the correct auth state and layout without client-side flashes (FOUC).
 */
export default defineNuxtPlugin(async () => {
  const { fetchSession, user } = useAuth();

  // If user state is already settled, skip
  if (user.value) {
    return;
  }

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie']);
    const rawCookies = headers.cookie || '';
    if (
      rawCookies.includes('access_token') ||
      rawCookies.includes('refresh_token')
    ) {
      await fetchSession();
    }
  } else {
    // Client-side: only fetch if SSR didn't already populate the session
    if (!user.value) {
      await fetchSession();
    }
  }
});
