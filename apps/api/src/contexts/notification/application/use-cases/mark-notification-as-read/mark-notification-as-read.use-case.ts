import {
  type InAppNotification,
  IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN,
  type InAppNotificationRepositoryDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import { NotificationNotFoundException } from '../../exceptions';
import type { MarkNotificationAsReadInput } from './mark-notification-as-read.dto';

export class MarkNotificationAsReadUseCase
  implements UseCase<MarkNotificationAsReadInput, InAppNotification>
{
  constructor(
    @Inject(IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN)
    private readonly repository: InAppNotificationRepositoryDrivenPort,
  ) {}

  async execute(
    input: MarkNotificationAsReadInput,
  ): Promise<InAppNotification> {
    const updated = await this.repository.markAsRead(input.id, input.userId);
    if (!updated) {
      throw new NotificationNotFoundException(input.id);
    }
    return updated;
  }
}
