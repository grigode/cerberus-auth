import type { LanguageCodeVo } from '../common';
import type { InAppNotificationVo } from './in-app-notification/in-app-notification.vo';

export interface VerificationEmailJobPayload {
  to: string;
  name: string;
  token: string;
  language: LanguageCodeVo;
}

export interface PasswordResetEmailJobPayload {
  to: string;
  name: string;
  token: string;
  language: LanguageCodeVo;
}

export interface InAppNotificationJobPayload {
  userId: string;
  title: string;
  message: string;
  type?: InAppNotificationVo;
  data?: Record<string, unknown>;
}

export interface NotificationQueueDriverPort {
  enqueueVerificationEmail(payload: VerificationEmailJobPayload): Promise<void>;
  enqueuePasswordResetEmail(
    payload: PasswordResetEmailJobPayload,
  ): Promise<void>;
  enqueueInAppNotification(payload: InAppNotificationJobPayload): Promise<void>;
}

export const NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN = Symbol(
  'NotificationQueueDriverPort',
);
