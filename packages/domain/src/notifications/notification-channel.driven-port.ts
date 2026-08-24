import type { NotificationTypeVo } from './notification.vo';

export interface NotificationPayload {
  recipient: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationChannelDrivenPort {
  type: NotificationTypeVo;
  send(payload: NotificationPayload): Promise<void>;
}
