import { Injectable, Logger } from '@nestjs/common';
import type {
  InAppNotification,
  InAppNotificationBroadcasterDrivenPort,
  NotificationStreamEvent,
} from '@core/domain';
import {
  filter,
  finalize,
  interval,
  map,
  merge,
  type Observable,
  Subject,
} from 'rxjs';

interface BroadcastPayload {
  targetUserId: string;
  event: NotificationStreamEvent;
}

@Injectable()
export class RxJsInAppNotificationBroadcasterAdapter
  implements InAppNotificationBroadcasterDrivenPort
{
  private readonly logger = new Logger(
    RxJsInAppNotificationBroadcasterAdapter.name,
  );
  private readonly stream$ = new Subject<BroadcastPayload>();

  publishToUser(userId: string, notification: InAppNotification): void {
    const data = notification.data;
    this.logger.log(
      `Broadcasting notification [${data.id}] to user [${userId}]`,
    );

    const messageEvent: NotificationStreamEvent = {
      type: 'notification',
      data: {
        id: data.id,
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        data: data.metadata,
        isRead: data.isRead,
        readAt: data.readAt,
        createdAt: data.createdAt,
      },
    };

    this.stream$.next({
      targetUserId: userId,
      event: messageEvent,
    });
  }

  subscribeUser(userId: string): Observable<NotificationStreamEvent> {
    this.logger.log(`User [${userId}] connected to SSE notifications stream`);

    // Periodic heartbeat ping every 15 seconds to keep connection alive
    const heartbeat$: Observable<NotificationStreamEvent> = interval(
      15000,
    ).pipe(
      map(() => ({
        type: 'ping',
        data: { timestamp: new Date().toISOString() },
      })),
    );

    // Notification stream filtered for this specific user
    const userNotifications$: Observable<NotificationStreamEvent> =
      this.stream$.pipe(
        filter((payload) => payload.targetUserId === userId),
        map((payload) => payload.event),
      );

    return merge(heartbeat$, userNotifications$).pipe(
      finalize(() => {
        this.logger.log(
          `User [${userId}] disconnected from SSE notifications stream`,
        );
      }),
    );
  }
}
