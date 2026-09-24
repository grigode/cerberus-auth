import { Controller, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
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
import { MarkNotificationAsReadUseCase } from '../../../application';
import { MarkNotificationAsReadResponseDto } from './mark-notification-as-read-response.dto';

@ApiTags('Notifications - In-App & Realtime SSE')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller('notifications')
export class MarkNotificationAsReadController
  implements BaseController<string, MarkNotificationAsReadResponseDto>
{
  constructor(
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  @ApiOperation({
    summary: 'Mark a single notification as read',
    description:
      'Updates the specified notification status to read for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read.',
    type: MarkNotificationAsReadResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  @AuditAction({
    action: 'MARK_NOTIFICATION_READ',
    category: 'NOTIFICATION',
    entityName: 'InAppNotification',
  })
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<MarkNotificationAsReadResponseDto> {
    const updated = await this.markNotificationAsReadUseCase.execute({
      id,
      userId,
    });
    return MarkNotificationAsReadResponseDto.fromDomain(updated);
  }
}
