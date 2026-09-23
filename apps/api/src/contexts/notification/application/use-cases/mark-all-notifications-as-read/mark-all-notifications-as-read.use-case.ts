import {
  IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN,
  type InAppNotificationRepositoryDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type {
  MarkAllNotificationsAsReadInput,
  MarkAllNotificationsAsReadResult,
} from './mark-all-notifications-as-read.dto';

export class MarkAllNotificationsAsReadUseCase
  implements
    UseCase<MarkAllNotificationsAsReadInput, MarkAllNotificationsAsReadResult>
{
  constructor(
    @Inject(IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN)
    private readonly repository: InAppNotificationRepositoryDrivenPort,
  ) {}

  async execute(
    input: MarkAllNotificationsAsReadInput,
  ): Promise<MarkAllNotificationsAsReadResult> {
    const updatedCount = await this.repository.markAllAsRead(input.userId);
    return { updatedCount };
  }
}
