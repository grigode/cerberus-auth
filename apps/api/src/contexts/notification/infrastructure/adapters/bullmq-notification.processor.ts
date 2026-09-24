import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type {
  InAppNotificationJobPayload,
  PasswordResetEmailJobPayload,
  VerificationEmailJobPayload,
} from '@core/domain';
import type { Job } from 'bullmq';

import {
  CreateInAppNotificationUseCase,
  SendPasswordResetEmailUseCase,
  SendVerificationEmailUseCase,
} from '../../application';
import { NOTIFICATIONS_QUEUE_NAME } from './bullmq-notification.producer';

@Processor(NOTIFICATIONS_QUEUE_NAME)
export class BullMQNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(BullMQNotificationProcessor.name);

  constructor(
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly sendPasswordResetEmailUseCase: SendPasswordResetEmailUseCase,
    private readonly createInAppNotificationUseCase: CreateInAppNotificationUseCase,
  ) {
    super();
  }

  async process(job: Job<unknown, unknown, string>): Promise<void> {
    this.logger.log(
      `Processing job '${job.name}' (ID: ${job.id ?? 'unknown'}, Attempt: ${job.attemptsMade + 1})`,
    );

    switch (job.name) {
      case 'send-verification-email': {
        const payload = job.data as VerificationEmailJobPayload;
        await this.sendVerificationEmailUseCase.execute(payload);
        break;
      }
      case 'send-password-reset-email': {
        const payload = job.data as PasswordResetEmailJobPayload;
        await this.sendPasswordResetEmailUseCase.execute(payload);
        break;
      }
      case 'send-in-app-notification': {
        const payload = job.data as InAppNotificationJobPayload;
        await this.createInAppNotificationUseCase.execute(payload);
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
