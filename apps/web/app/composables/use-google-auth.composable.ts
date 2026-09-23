export const useGoogleAuth = () => {
  const config = useRuntimeConfig();
  const redirecting = ref(false);

  // Full-page redirect to the backend, which starts the Google OAuth flow,
  // handles the callback, sets the session cookie and redirects back to the
  // frontend (/dashboard on success, /login?error=... on failure).
  const loginWithGoogle = () => {
    redirecting.value = true;
    window.location.href = `${config.public.apiBaseUrl}/iam/social/google`;
  };

  return {
    redirecting,
    loginWithGoogle,
  };
};
