export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth();
  const isAuth = !!auth?.isAuthenticated?.value;

  // Root redirect: send authenticated users to dashboard, guests to login.
  if (to.path === '/') {
    return navigateTo(isAuth ? '/dashboard' : '/login', {
      redirectCode: 302,
    });
  }

  // Pages that require a session: bounce anonymous users to login.
  if (to.meta.requiresAuth && !isAuth) {
    return navigateTo('/login');
  }

  // Guest-only pages (login, register, ...): keep authenticated users out.
  if (to.meta.guestOnly && isAuth) {
    return navigateTo('/dashboard');
  }
});
