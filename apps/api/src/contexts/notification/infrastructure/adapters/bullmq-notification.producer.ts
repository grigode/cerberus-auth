import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';

import type {
  InAppNotificationJobPayload,
  NotificationQueueDriverPort,
  PasswordResetEmailJobPayload,
  VerificationEmailJobPayload,
} from '@core/domain';

export const NOTIFICATIONS_QUEUE_NAME = 'notifications';

@Injectable()
export class BullMQNotificationProducer implements NotificationQueueDriverPort {
  private readonly logger = new Logger(BullMQNotificationProducer.name);

  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE_NAME)
    private readonly notificationsQueue: Queue,
  ) {}

  async enqueueVerificationEmail(
    payload: VerificationEmailJobPayload,
  ): Promise<void> {
    this.logger.log(`Enqueueing verification email job for ${payload.to}`);
    await this.notificationsQueue.add('send-verification-email', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
  }

  async enqueuePasswordResetEmail(
    payload: PasswordResetEmailJobPayload,
  ): Promise<void> {
    this.logger.log(`Enqueueing password reset email job for ${payload.to}`);
    await this.notificationsQueue.add('send-password-reset-email', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
  }

  async enqueueInAppNotification(
    payload: InAppNotificationJobPayload,
  ): Promise<void> {
    this.logger.log(
      `Enqueueing in-app notification job for user ${payload.userId}`,
    );
    await this.notificationsQueue.add('send-in-app-notification', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: true,
    });
  }
}
