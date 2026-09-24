import { Controller, Sse } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { NotificationStreamEvent } from '@core/domain';
import type { Controller as BaseController } from '@core/shared-server';
import type { Observable } from 'rxjs';

import { CurrentUser } from '../../../../iam/infrastructure/http/decorators/current-user.decorator';
import { StreamInAppNotificationsUseCase } from '../../../application';
import { NotificationStreamEventResponseDto } from './notification-stream-event-response.dto';

@ApiTags('Notifications - In-App & Realtime SSE')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller('notifications')
export class StreamInAppNotificationsController
  implements BaseController<string, Observable<NotificationStreamEvent>>
{
  constructor(
    private readonly streamInAppNotificationsUseCase: StreamInAppNotificationsUseCase,
  ) {}

  @ApiOperation({
    summary: 'Subscribe to real-time notification stream (SSE)',
    description:
      'Establishes a Server-Sent Events (SSE) stream for real-time notification updates. Includes periodic 15-second keep-alive pings.',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream connected successfully.',
    type: NotificationStreamEventResponseDto,
  })
  @Sse('sse')
  async handle(
    @CurrentUser('id') userId: string,
  ): Promise<Observable<NotificationStreamEvent>> {
    return this.streamInAppNotificationsUseCase.execute({ userId });
  }
}
