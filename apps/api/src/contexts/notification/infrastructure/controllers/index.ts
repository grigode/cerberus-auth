import { GetNotificationHistoryController } from './get-notification-history';
import { MarkAllNotificationsAsReadController } from './mark-all-notifications-as-read';
import { MarkNotificationAsReadController } from './mark-notification-as-read';
import { StreamInAppNotificationsController } from './stream-in-app-notifications';

export * from './get-notification-history';
export * from './mark-all-notifications-as-read';
export * from './mark-notification-as-read';
export * from './stream-in-app-notifications';

export const notificationControllers = [
  StreamInAppNotificationsController,
  GetNotificationHistoryController,
  MarkNotificationAsReadController,
  MarkAllNotificationsAsReadController,
];
