<script setup lang="ts">
import NotificationItem from './NotificationItem.vue';
import { useNotifications } from '../composables/use-notifications.composable';

const {
  notifications,
  filteredNotifications,
  unreadCount,
  isLoading,
  isInitialLoaded,
  hasMore,
  activeFilter,
  fetchNotifications,
  loadMore,
  markAsRead,
  markAllAsRead,
  connectSse,
  disconnectSse,
} = useNotifications();

const { ts } = useI18nShorter('notifications.center');

onMounted(() => {
  fetchNotifications(true);
  connectSse();
});

onUnmounted(() => {
  disconnectSse();
});
</script>

<template>
  <ClientOnly>
    <UPopover
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8,
      }"
    >
      <!-- Bell Trigger Button -->
      <UButton
        color="neutral"
        variant="ghost"
        size="md"
        class="relative cursor-pointer rounded-full p-2 hover:bg-elevated transition-colors"
        :aria-label="ts('title')"
      >
        <UIcon name="i-lucide-bell" class="size-5 text-muted hover:text-highlighted transition-colors" />

        <!-- Unread Badge Pill -->
        <span
          v-if="unreadCount > 0"
          class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in fade-in zoom-in duration-200"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </UButton>

      <!-- Popover Dropdown Panel -->
      <template #content>
        <div class="flex flex-col w-85 sm:w-95 bg-background border border-default rounded-xl shadow-xl overflow-hidden">
          <!-- Panel Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-default bg-elevated/40">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-sm text-highlighted">
                {{ ts('title') }}
              </h3>
              <UBadge
                v-if="unreadCount > 0"
                color="primary"
                variant="subtle"
                size="xs"
              >
                {{ ts('unreadCount', { count: unreadCount }) }}
              </UBadge>
            </div>

            <UButton
              v-if="unreadCount > 0"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-check-check"
              class="cursor-pointer text-xs text-muted hover:text-primary transition-colors"
              @click="markAllAsRead"
            >
              {{ ts('markAllRead') }}
            </UButton>
          </div>

          <!-- Filter Navigation Tabs -->
          <div class="flex items-center gap-1 px-4 py-2 border-b border-default bg-muted/10 text-xs">
            <button
              type="button"
              class="px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
              :class="activeFilter === 'all' ? 'bg-primary text-white shadow-xs' : 'text-muted hover:text-highlighted hover:bg-elevated/50'"
              @click="activeFilter = 'all'"
            >
              {{ ts('filterAll') }}
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              :class="activeFilter === 'unread' ? 'bg-primary text-white shadow-xs' : 'text-muted hover:text-highlighted hover:bg-elevated/50'"
              @click="activeFilter = 'unread'"
            >
              <span>{{ ts('filterUnread') }}</span>
              <span
                v-if="unreadCount > 0"
                class="px-1.5 py-0.2 rounded-full text-[10px]"
                :class="activeFilter === 'unread' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary font-bold'"
              >
                {{ unreadCount }}
              </span>
            </button>
          </div>

          <!-- Scrollable Notification Items List -->
          <div class="max-h-90 overflow-y-auto divide-y divide-default">
            <!-- Loading Skeletons -->
            <div v-if="isLoading && !isInitialLoaded" class="flex flex-col p-4 gap-3">
              <div v-for="i in 3" :key="i" class="flex items-start gap-3">
                <USkeleton class="size-8 rounded-lg shrink-0" />
                <div class="flex-1 flex flex-col gap-1.5">
                  <USkeleton class="h-3.5 w-3/4" />
                  <USkeleton class="h-3 w-full" />
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="filteredNotifications.length === 0"
              class="flex flex-col items-center justify-center py-10 px-4 text-center"
            >
              <div class="flex size-12 items-center justify-center rounded-full bg-elevated/70 text-muted mb-2">
                <UIcon name="i-lucide-bell-off" class="size-6" />
              </div>
              <p class="text-sm font-medium text-highlighted">
                {{ ts('emptyTitle') }}
              </p>
              <p class="text-xs text-muted max-w-55 mt-1">
                {{ ts('emptyDescription') }}
              </p>
            </div>

            <!-- Notification Items -->
            <NotificationItem
              v-for="item in filteredNotifications"
              :key="item.id"
              :notification="item"
              @read="markAsRead"
            />
          </div>

          <!-- Load More Footer -->
          <div
            v-if="hasMore"
            class="p-2 border-t border-default text-center bg-elevated/30"
          >
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              block
              :loading="isLoading"
              class="cursor-pointer text-xs text-muted hover:text-highlighted"
              @click="loadMore"
            >
              {{ ts('loadMore') }}
            </UButton>
          </div>
        </div>
      </template>
    </UPopover>

    <!-- SSR Fallback -->
    <template #fallback>
      <UButton
        color="neutral"
        variant="ghost"
        size="md"
        class="cursor-pointer rounded-full p-2"
        disabled
      >
        <UIcon name="i-lucide-bell" class="size-5 text-muted opacity-50" />
      </UButton>
    </template>
  </ClientOnly>
</template>
