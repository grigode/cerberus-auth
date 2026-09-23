import type { RouterConfig } from 'nuxt/schema';
import type { RouteRecordRaw } from 'vue-router';

import { router as authRouter } from '~/features/auth/auth.router';

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
  routes: (_routes) => [...authRouter, ...appRoutes],
} satisfies RouterConfig;
