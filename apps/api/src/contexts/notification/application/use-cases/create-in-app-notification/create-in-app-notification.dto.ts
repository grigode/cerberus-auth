import type { InAppNotificationType } from '@core/domain';

export interface CreateInAppNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: InAppNotificationType;
  data?: Record<string, unknown>;
}
