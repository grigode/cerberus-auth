import { NotFoundApplicationException } from '@core/shared-server';

export class NotificationNotFoundException extends NotFoundApplicationException {
  constructor(id: string) {
    super(
      'NOTIFICATION_NOT_FOUND',
      `Notification with ID '${id}' was not found or access denied`,
    );
  }
}
