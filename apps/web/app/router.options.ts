import type { RouterConfig } from 'nuxt/schema';
import type { RouteRecordRaw } from 'vue-router';

import { getFeatureRoutes } from '~/features/registry';

const appRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('~/pages/index.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('~/pages/dashboard.vue'),
    meta: { requiresAuth: true, layout: 'authenticated' },
  },
];

export default {
  routes: (_routes) => [...getFeatureRoutes(), ...appRoutes],
} satisfies RouterConfig;
