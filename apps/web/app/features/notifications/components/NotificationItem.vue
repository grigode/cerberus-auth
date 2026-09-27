<script setup lang="ts">
import type { InAppNotificationDto } from '~/types/contracts';

const props = defineProps<{
  notification: InAppNotificationDto;
}>();

const emit = defineEmits<(e: 'read', id: string) => void>();

const { locale } = useI18n();
const { ts } = useI18nShorter('notifications.item');

const typeConfig = computed(() => {
  switch (props.notification.type) {
    case 'SUCCESS':
      return {
        icon: 'i-lucide-check-circle-2',
        color: 'text-success',
        bgColor: 'bg-success/15',
      };
    case 'WARNING':
      return {
        icon: 'i-lucide-alert-triangle',
        color: 'text-warning',
        bgColor: 'bg-warning/15',
      };
    case 'ERROR':
      return {
        icon: 'i-lucide-alert-circle',
        color: 'text-error',
        bgColor: 'bg-error/15',
      };
    case 'SYSTEM':
      return {
        icon: 'i-lucide-shield-alert',
        color: 'text-primary',
        bgColor: 'bg-primary/15',
      };
    case 'INFO':
      return {
        icon: 'i-lucide-info',
        color: 'text-info',
        bgColor: 'bg-info/15',
      };
    default:
      return {
        icon: 'i-lucide-info',
        color: 'text-info',
        bgColor: 'bg-info/15',
      };
  }
});

const formattedTime = computed(() => {
  if (!props.notification.createdAt) return '';
  const date = new Date(props.notification.createdAt);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) {
    return locale.value === 'es' ? 'Ahora mismo' : 'Just now';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return locale.value === 'es' ? `Hace ${diffMin}m` : `${diffMin}m ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return locale.value === 'es' ? `Hace ${diffHours}h` : `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return locale.value === 'es' ? `Hace ${diffDays}d` : `${diffDays}d ago`;
  }

  return date.toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
});

const onMarkAsRead = (event: MouseEvent) => {
  event.stopPropagation();
  emit('read', props.notification.id);
};
</script>

<template>
  <div
    class="group relative flex items-start gap-3 p-3.5 transition-colors duration-150 border-b border-default last:border-b-0 cursor-default"
    :class="notification.isRead ? 'opacity-85 hover:bg-elevated/40' : 'bg-primary/5 hover:bg-primary/10'"
  >
    <!-- Notification Type Icon Badge -->
    <div
      class="flex size-8 shrink-0 items-center justify-center rounded-lg"
      :class="[typeConfig.bgColor, typeConfig.color]"
    >
      <UIcon :name="typeConfig.icon" class="size-4.5" />
    </div>

    <!-- Content Area -->
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="flex items-start justify-between gap-2">
        <h4
          class="text-xs font-semibold leading-snug line-clamp-1"
          :class="notification.isRead ? 'text-default' : 'text-highlighted'"
        >
          {{ notification.title }}
        </h4>

        <!-- Relative Timestamp & Unread Dot -->
        <div class="flex shrink-0 items-center gap-1.5 pt-0.5">
          <span class="text-[11px] text-muted whitespace-nowrap">
            {{ formattedTime }}
          </span>
          <span
            v-if="!notification.isRead"
            class="size-2 rounded-full bg-primary shrink-0"
            :title="ts('unread')"
          />
        </div>
      </div>

      <p class="text-xs leading-relaxed text-muted line-clamp-2">
        {{ notification.message }}
      </p>

      <!-- Action Button / Mark as Read -->
      <div v-if="!notification.isRead" class="mt-1 flex items-center justify-end">
        <button
          type="button"
          class="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
          @click="onMarkAsRead"
        >
          <UIcon name="i-lucide-check" class="size-3" />
          {{ ts('markAsRead') }}
        </button>
      </div>
    </div>
  </div>
</template>
