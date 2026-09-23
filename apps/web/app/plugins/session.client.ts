// Restores the authenticated session on app load (client-side, where the
// browser attaches the HTTP-only session cookie). Awaited so the auth state
// is settled before the app becomes interactive — protected routes can then
// rely on it.
export default defineNuxtPlugin(async () => {
  const { fetchSession } = useAuth();
  await fetchSession();
});
