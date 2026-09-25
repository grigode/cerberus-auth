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

  // Track if SSR has already evaluated cookie presence
  const sessionChecked = useState<boolean>('auth.session_checked', () => false);

  if (import.meta.server) {
    sessionChecked.value = true;
    const headers = useRequestHeaders(['cookie']);
    const rawCookies = headers.cookie || '';
    if (
      rawCookies.includes('access_token') ||
      rawCookies.includes('refresh_token')
    ) {
      await fetchSession();
    }
  } else {
    // If SSR ran and determined there were no session cookies, don't execute a redundant fetch
    if (sessionChecked.value) {
      return;
    }

    // Client-side only execution (e.g. SPA mode where SSR did not run)
    await fetchSession();
  }
});
