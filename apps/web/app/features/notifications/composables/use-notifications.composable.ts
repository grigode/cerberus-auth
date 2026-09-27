import type { InAppNotificationDto } from '~/types/contracts';
import { useNotificationRepository } from '~/composables/use-repositories.composable';

let sseConnection: EventSource | null = null;

export const useNotifications = () => {
  const repo = useNotificationRepository();
  const config = useRuntimeConfig();

  const notifications = useState<InAppNotificationDto[]>(
    'in_app_notifications',
    () => [],
  );
  const unreadCount = useState<number>(
    'in_app_notifications_unread_count',
    () => 0,
  );
  const total = useState<number>('in_app_notifications_total', () => 0);
  const isLoading = useState<boolean>(
    'in_app_notifications_loading',
    () => false,
  );
  const isInitialLoaded = useState<boolean>(
    'in_app_notifications_initial_loaded',
    () => false,
  );
  const activeFilter = useState<'all' | 'unread'>(
    'in_app_notifications_filter',
    () => 'all',
  );
  const currentPage = useState<number>('in_app_notifications_page', () => 1);
  const limit = 20;

  const hasMore = computed(() => notifications.value.length < total.value);

  const filteredNotifications = computed(() => {
    if (activeFilter.value === 'unread') {
      return notifications.value.filter((n) => !n.isRead);
    }
    return notifications.value;
  });

  const fetchNotifications = async (reset = false) => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
      const pageToFetch = reset ? 1 : currentPage.value;
      const res = await repo.getNotifications({
        page: pageToFetch,
        limit,
      });

      if (reset) {
        notifications.value = res.data;
        currentPage.value = 1;
      } else {
        // Avoid duplicate ids when merging paginated pages
        const existingIds = new Set(notifications.value.map((n) => n.id));
        const newItems = res.data.filter((n) => !existingIds.has(n.id));
        notifications.value = [...notifications.value, ...newItems];
      }

      total.value = res.total;
      unreadCount.value = res.unreadCount;
      isInitialLoaded.value = true;
    } catch (err) {
      console.error('Failed to fetch in-app notifications:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const loadMore = async () => {
    if (isLoading.value || !hasMore.value) return;
    currentPage.value++;
    await fetchNotifications(false);
  };

  const markAsRead = async (id: string) => {
    const item = notifications.value.find((n) => n.id === id);
    if (!item || item.isRead) return;

    // Optimistic update
    item.isRead = true;
    item.readAt = new Date().toISOString();
    if (unreadCount.value > 0) {
      unreadCount.value--;
    }

    try {
      await repo.markAsRead(id);
    } catch (err) {
      // Revert if API fails
      item.isRead = false;
      item.readAt = null;
      unreadCount.value++;
      console.error(`Failed to mark notification [${id}] as read:`, err);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount.value === 0) return;

    // Optimistic update
    const previousUnread = unreadCount.value;
    const previouslyUnreadIds = notifications.value
      .filter((n) => !n.isRead)
      .map((n) => n.id);

    for (const n of notifications.value) {
      n.isRead = true;
      n.readAt = new Date().toISOString();
    }
    unreadCount.value = 0;

    try {
      await repo.markAllAsRead();
    } catch (err) {
      // Revert on failure
      for (const n of notifications.value) {
        if (previouslyUnreadIds.includes(n.id)) {
          n.isRead = false;
          n.readAt = null;
        }
      }
      unreadCount.value = previousUnread;
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleIncomingPayload = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return;

    const data = payload as {
      type?: string;
      data?: InAppNotificationDto;
      id?: string;
      title?: string;
    };

    let notification: InAppNotificationDto | null = null;

    if (data.type === 'notification' && data.data) {
      notification = data.data;
    } else if (data.id && data.title) {
      notification = data as unknown as InAppNotificationDto;
    }

    if (notification?.id) {
      const exists = notifications.value.some((n) => n.id === notification?.id);
      if (!exists) {
        notifications.value.unshift(notification);
        total.value++;
        if (!notification.isRead) {
          unreadCount.value++;
        }
      }
    }
  };

  const connectSse = () => {
    if (!import.meta.client) return;
    if (sseConnection && sseConnection.readyState !== EventSource.CLOSED) {
      return;
    }

    const sseUrl = `${config.public.apiBaseUrl}/notifications/sse`;

    try {
      sseConnection = new EventSource(sseUrl, { withCredentials: true });

      sseConnection.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          handleIncomingPayload(parsed);
        } catch {
          // ignore non-json ping/heartbeat events
        }
      };

      sseConnection.addEventListener('notification', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          handleIncomingPayload(parsed);
        } catch {
          // ignore parsing error
        }
      });

      sseConnection.onerror = () => {
        // EventSource will automatically attempt to reconnect
      };
    } catch (err) {
      console.warn('Could not establish SSE notification connection:', err);
    }
  };

  const disconnectSse = () => {
    if (sseConnection) {
      sseConnection.close();
      sseConnection = null;
    }
  };

  return {
    notifications,
    filteredNotifications,
    unreadCount,
    total,
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
  };
};
