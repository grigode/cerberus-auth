export const useAPI = createUseFetch({
  baseURL: useRuntimeConfig().public.apiBaseUrl,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});
