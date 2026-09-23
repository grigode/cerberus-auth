<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

import Logo from '~/assets/icons/logo.vue';

const { ts } = useI18nShorter('core.layout');
const { user, logout } = useAuth();
const route = useRoute();

// Primary navigation. Only Dashboard is live today; the upcoming modules are
// shown disabled with a "Soon" badge so the layout reflects the app's full
// information architecture without shipping broken links. Each feature PR
// (Tasks, Calendar, Notes, ...) flips its entry to a real `to` route.
const links = computed<NavigationMenuItem[]>(() => [
  {
    label: ts('nav.dashboard'),
    icon: 'i-lucide-layout-dashboard',
    to: '/dashboard',
  },
]);

// Navbar title tracks the active section, falling back to the brand.
const activeTitle = computed(
  () => links.value.find((l) => l.to === route.path)?.label ?? ts('brand'),
);

const userName = computed(() =>
  user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
);

const initials = computed(() => {
  if (!user.value) return '';
  return `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}`.toUpperCase();
});

const onLogout = async () => {
  await logout();
};

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: userName.value,
      avatar: { text: initials.value },
      type: 'label',
    },
  ],
  [
    {
      label: ts('userMenu.logout'),
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: () => onLogout(),
    },
  ],
]);
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-2 overflow-hidden"
        >
          <Logo class="fill-primary size-8 shrink-0" />
          <span v-if="!collapsed" class="text-lg font-semibold truncate">
            {{ ts("brand") }}
          </span>
        </NuxtLink>

        <UDashboardSidebarCollapse class="ms-auto" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="links"
          :collapsed="collapsed"
          orientation="vertical"
          class="w-full"
        />
      </template>

      <template #footer="{ collapsed }">
        <UDropdownMenu
          :items="userMenuItems"
          :content="{ align: 'start', side: collapsed ? 'right' : 'top' }"
          class="w-full"
        >
          <UButton
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
            :aria-label="collapsed && userName ? userName : undefined"
            class="cursor-pointer"
            :class="collapsed ? '' : 'justify-start'"
          >
            <!-- User data is client-only (session restored on the client), so
                 defer it to avoid an empty SSR render and hydration mismatch. -->
            <ClientOnly>
              <UAvatar :text="initials" size="2xs" />
              <span v-if="!collapsed" class="truncate">{{ userName }}</span>

              <template #fallback>
                <UAvatar size="2xs" />
                <USkeleton v-if="!collapsed" class="w-24 h-4" />
              </template>
            </ClientOnly>
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="activeTitle" />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
