import {
  IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN,
  type InAppNotificationBroadcasterDrivenPort,
  type NotificationStreamEvent,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import type { Observable } from 'rxjs';

import type { StreamInAppNotificationsInput } from './stream-in-app-notifications.dto';

export class StreamInAppNotificationsUseCase
  implements
    UseCase<StreamInAppNotificationsInput, Observable<NotificationStreamEvent>>
{
  constructor(
    @Inject(IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN)
    private readonly broadcaster: InAppNotificationBroadcasterDrivenPort,
  ) {}

  execute(
    input: StreamInAppNotificationsInput,
  ): Promise<Observable<NotificationStreamEvent>> {
    return Promise.resolve(this.broadcaster.subscribeUser(input.userId));
  }
}
