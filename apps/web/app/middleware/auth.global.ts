export default defineNuxtRouteMiddleware((to) => {
  // The session is restored client-side (the HTTP-only cookie is only sent by
  // the browser), so the authenticated state is only known on the client.
  // Let SSR render and enforce the guards after the session plugin has run.
  if (import.meta.server) return;

  const { isAuthenticated } = useAuth();

  // Pages that require a session: bounce anonymous users to login.
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return navigateTo('/login');
  }

  // Guest-only pages (login, register, ...): keep authenticated users out.
  if (to.meta.guestOnly && isAuthenticated.value) {
    return navigateTo('/dashboard');
  }
});
