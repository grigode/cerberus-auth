import type { RouteRecordRaw } from 'vue-router';

export const router: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('./pages/login/index.vue'),
    meta: { layout: 'public-auth', guestOnly: true },
  },
  {
    path: '/register',
    component: () => import('./pages/register/index.vue'),
    meta: { layout: 'public-auth', guestOnly: true },
  },
  {
    path: '/confirm-email-pending',
    component: () => import('./pages/confirm-email-pending/index.vue'),
    meta: { layout: 'public-auth' },
  },
  {
    path: '/confirm-email',
    component: () => import('./pages/confirm-email/index.vue'),
    meta: { layout: 'public-auth' },
  },
  {
    path: '/forgot-password',
    component: () => import('./pages/forgot-password/index.vue'),
    meta: { layout: 'public-auth', guestOnly: true },
  },
  {
    path: '/reset-password',
    component: () => import('./pages/reset-password/index.vue'),
    meta: { layout: 'public-auth', guestOnly: true },
  },
  {
    path: '/auth/mfa',
    component: () => import('./pages/mfa/index.vue'),
    meta: { layout: 'public-auth' },
  },
  {
    path: '/mfa',
    component: () => import('./pages/mfa/index.vue'),
    meta: { layout: 'public-auth' },
  },
];
