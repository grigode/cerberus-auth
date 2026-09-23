import {
  InAppNotification,
  IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN,
  IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN,
  type InAppNotificationBroadcasterDrivenPort,
  type InAppNotificationRepositoryDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { CreateInAppNotificationInput } from './create-in-app-notification.dto';

export class CreateInAppNotificationUseCase
  implements UseCase<CreateInAppNotificationInput, InAppNotification>
{
  constructor(
    @Inject(IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN)
    private readonly repository: InAppNotificationRepositoryDrivenPort,
    @Inject(IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN)
    private readonly broadcaster: InAppNotificationBroadcasterDrivenPort,
  ) {}

  async execute(
    input: CreateInAppNotificationInput,
  ): Promise<InAppNotification> {
    const notification = new InAppNotification({
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      metadata: input.data,
    });

    const saved = await this.repository.save(notification);
    this.broadcaster.publishToUser(saved.data.userId, saved);
    return saved;
  }
}
