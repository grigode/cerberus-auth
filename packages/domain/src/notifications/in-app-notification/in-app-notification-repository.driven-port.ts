import type { InAppNotification } from './in-app-notification.entity';

export interface FindNotificationOptions {
  userId: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface PaginatedNotificationsResult {
  notifications: InAppNotification[];
  total: number;
  unreadCount: number;
}

export const IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN = Symbol(
  'InAppNotificationRepositoryDrivenPort',
);

export interface InAppNotificationRepositoryDrivenPort {
  findById(id: string): Promise<InAppNotification | null>;
  findAndCountByUserId(
    options: FindNotificationOptions,
  ): Promise<PaginatedNotificationsResult>;
  getUnreadCount(userId: string): Promise<number>;

  save(notification: InAppNotification): Promise<InAppNotification>;

  markAsRead(id: string, userId: string): Promise<InAppNotification | null>;
  markAllAsRead(userId: string): Promise<number>;
}
