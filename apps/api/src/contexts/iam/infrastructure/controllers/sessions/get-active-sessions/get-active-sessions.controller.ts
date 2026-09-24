import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { GetActiveSessionsUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { UserSessionResponseDto } from './get-active-sessions-response.dto';
import { CurrentUser } from '../../../http';

@ApiTags('IAM - Sessions')
@Controller('iam/sessions')
export class GetActiveSessionsController
  implements BaseController<string, UserSessionResponseDto[]>
{
  constructor(
    private readonly getActiveSessionsUseCase: GetActiveSessionsUseCase,
  ) {}

  @ApiOperation({
    summary: 'List active user sessions',
    description:
      'Returns a list of all non-expired, active session devices for the authenticated user.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Active sessions retrieved successfully',
    type: [UserSessionResponseDto],
  })
  @Get()
  async handle(
    @CurrentUser('id') userId: string,
    @Req() req: FastifyRequest,
  ): Promise<UserSessionResponseDto[]> {
    const currentRefreshToken = req.cookies?.refresh_token;

    return await this.getActiveSessionsUseCase.execute({
      userId,
      currentRefreshToken,
    });
  }
}
