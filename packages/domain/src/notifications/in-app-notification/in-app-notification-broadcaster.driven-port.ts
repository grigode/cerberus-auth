import type { Observable } from 'rxjs';

import type { InAppNotification } from './in-app-notification.entity';

export interface NotificationStreamEvent<T = Record<string, unknown> | string> {
  data: T;
  id?: string;
  type?: string;
  retry?: number;
}

export interface InAppNotificationBroadcasterDrivenPort {
  publishToUser(userId: string, notification: InAppNotification): void;
  subscribeUser(userId: string): Observable<NotificationStreamEvent>;
}
