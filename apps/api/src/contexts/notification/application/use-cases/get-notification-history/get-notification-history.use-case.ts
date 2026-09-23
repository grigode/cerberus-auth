import {
  IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN,
  type InAppNotificationRepositoryDrivenPort,
  type PaginatedNotificationsResult,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { GetNotificationHistoryInput } from './get-notification-history.dto';

export class GetNotificationHistoryUseCase
  implements UseCase<GetNotificationHistoryInput, PaginatedNotificationsResult>
{
  constructor(
    @Inject(IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN)
    private readonly repository: InAppNotificationRepositoryDrivenPort,
  ) {}

  async execute(
    input: GetNotificationHistoryInput,
  ): Promise<PaginatedNotificationsResult> {
    return this.repository.findAndCountByUserId({
      userId: input.userId,
      page: input.page ?? 1,
      limit: input.limit ?? 20,
      isRead: input.isRead,
    });
  }
}
