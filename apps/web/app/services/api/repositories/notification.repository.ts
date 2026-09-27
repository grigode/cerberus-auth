import type {
  InAppNotificationDto,
  MarkAllNotificationsReadResponseDto,
  PaginatedNotificationsDto,
  QueryNotificationsParams,
} from '~/types/contracts';
import { BaseRepository } from './base.repository';

export interface INotificationRepository {
  getNotifications(
    params?: QueryNotificationsParams,
  ): Promise<PaginatedNotificationsDto>;
  markAsRead(id: string): Promise<InAppNotificationDto>;
  markAllAsRead(): Promise<MarkAllNotificationsReadResponseDto>;
}

export class NotificationRepository
  extends BaseRepository
  implements INotificationRepository
{
  getNotifications(
    params?: QueryNotificationsParams,
  ): Promise<PaginatedNotificationsDto> {
    return this.get<PaginatedNotificationsDto>('/notifications', {
      query: params,
    });
  }

  markAsRead(id: string): Promise<InAppNotificationDto> {
    return this.patch<InAppNotificationDto>(`/notifications/${id}/read`);
  }

  markAllAsRead(): Promise<MarkAllNotificationsReadResponseDto> {
    return this.patch<MarkAllNotificationsReadResponseDto>(
      '/notifications/read-all',
    );
  }
}
