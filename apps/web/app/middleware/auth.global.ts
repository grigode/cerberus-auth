export default defineNuxtRouteMiddleware((to) => {
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
