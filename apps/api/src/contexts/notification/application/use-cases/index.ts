import { CreateInAppNotificationUseCase } from './create-in-app-notification';
import { GetNotificationHistoryUseCase } from './get-notification-history';
import { MarkAllNotificationsAsReadUseCase } from './mark-all-notifications-as-read';
import { MarkNotificationAsReadUseCase } from './mark-notification-as-read';
import { SendPasswordResetEmailUseCase } from './send-password-reset-email';
import { SendVerificationEmailUseCase } from './send-verification-email';
import { StreamInAppNotificationsUseCase } from './stream-in-app-notifications';

export * from './create-in-app-notification';
export * from './get-notification-history';
export * from './mark-all-notifications-as-read';
export * from './mark-notification-as-read';
export * from './send-password-reset-email';
export * from './send-verification-email';
export * from './stream-in-app-notifications';

export const useCases = [
  SendVerificationEmailUseCase,
  SendPasswordResetEmailUseCase,
  CreateInAppNotificationUseCase,
  GetNotificationHistoryUseCase,
  MarkNotificationAsReadUseCase,
  MarkAllNotificationsAsReadUseCase,
  StreamInAppNotificationsUseCase,
];
