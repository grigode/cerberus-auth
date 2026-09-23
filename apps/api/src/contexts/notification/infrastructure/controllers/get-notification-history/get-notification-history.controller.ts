import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Controller as BaseController } from '@core/shared-server';

import { CurrentUser } from '../../../../iam/infrastructure/http/decorators/current-user.decorator';
import type { GetNotificationHistoryUseCase } from '../../../application';
import {
  InAppNotificationResponseDto,
  PaginatedNotificationsResponseDto,
} from './in-app-notification-response.dto';
import type { QueryNotificationsDto } from './query-notifications.dto';

@ApiTags('Notifications - In-App & Realtime SSE')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller('notifications')
export class GetNotificationHistoryController
  implements
    BaseController<QueryNotificationsDto, PaginatedNotificationsResponseDto>
{
  constructor(
    private readonly getNotificationHistoryUseCase: GetNotificationHistoryUseCase,
  ) {}

  @ApiOperation({
    summary: 'Retrieve user notification history',
    description:
      'Returns paginated list of notifications for the authenticated user, total count, and total unread count.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved successfully.',
    type: PaginatedNotificationsResponseDto,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser('id') userId: string,
    @Query() query: QueryNotificationsDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    const result = await this.getNotificationHistoryUseCase.execute({
      userId,
      page: query.page,
      limit: query.limit,
      isRead: query.isRead,
    });

    return {
      data: result.notifications.map((n) =>
        InAppNotificationResponseDto.fromDomain(n),
      ),
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      total: result.total,
      unreadCount: result.unreadCount,
    };
  }
}
