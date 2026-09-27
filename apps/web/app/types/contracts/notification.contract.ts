import type { InAppNotificationType } from '@core/domain';

// ----------------------------------------------------
// In-App Notification Contracts
// ----------------------------------------------------

export type NotificationType =
  | `${InAppNotificationType}`
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'SYSTEM';

export interface InAppNotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedNotificationsDto {
  data: InAppNotificationDto[];
  page: number;
  limit: number;
  total: number;
  unreadCount: number;
}

export interface QueryNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface MarkAllNotificationsReadResponseDto {
  updatedCount: number;
}

export interface NotificationStreamEventDto {
  type?: string;
  data: InAppNotificationDto | Record<string, unknown> | string;
  id?: string;
  retry?: number;
}
