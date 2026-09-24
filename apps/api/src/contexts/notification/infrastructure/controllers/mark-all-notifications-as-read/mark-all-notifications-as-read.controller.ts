import { Controller, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuditAction,
  type Controller as BaseController,
} from '@core/shared-server';

import { CurrentUser } from '../../../../iam/infrastructure/http/decorators/current-user.decorator';
import { MarkAllNotificationsAsReadUseCase } from '../../../application';
import { MarkAllNotificationsAsReadResponseDto } from './mark-all-notifications-as-read-response.dto';

@ApiTags('Notifications - In-App & Realtime SSE')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller('notifications')
export class MarkAllNotificationsAsReadController
  implements BaseController<string, MarkAllNotificationsAsReadResponseDto>
{
  constructor(
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
  ) {}

  @ApiOperation({
    summary: 'Mark all unread notifications as read',
    description:
      'Marks all unread notifications as read for the authenticated user and returns updated count.',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read.',
    type: MarkAllNotificationsAsReadResponseDto,
  })
  @AuditAction({
    action: 'MARK_ALL_NOTIFICATIONS_READ',
    category: 'NOTIFICATION',
    entityName: 'InAppNotification',
  })
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser('id') userId: string,
  ): Promise<MarkAllNotificationsAsReadResponseDto> {
    const result = await this.markAllNotificationsAsReadUseCase.execute({
      userId,
    });
    return { updatedCount: result.updatedCount };
  }
}
