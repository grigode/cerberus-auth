import type { ApiClient } from '~/services/api/api-client';
import { useApiClient } from '~/composables/use-api';

export default defineNuxtPlugin(() => {
  const api: ApiClient = useApiClient();
  return {
    provide: {
      api,
    },
  };
});
