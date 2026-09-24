import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RevokeSessionUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { CurrentUser } from '../../../http';

@ApiTags('IAM - Sessions')
@Controller('iam/sessions')
export class RevokeSessionController
  implements BaseController<{ userId: string; sessionId: string }, void>
{
  constructor(private readonly revokeSessionUseCase: RevokeSessionUseCase) {}

  @ApiOperation({
    summary: 'Revoke specific session',
    description:
      'Terminates a specific session by ID for the current authenticated user.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session to revoke',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 204,
    description: 'Session revoked successfully',
  })
  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.revokeSessionUseCase.execute({ userId, sessionId });
  }
}
