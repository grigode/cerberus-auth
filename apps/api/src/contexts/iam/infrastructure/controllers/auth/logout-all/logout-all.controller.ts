import { Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { getCookieOptions } from '@core/shared-server';
import type { AppConfigService } from '@core/config';
import type { LogoutAllUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { CurrentUser } from '../../../http';

@ApiTags('IAM - Authentication')
@Controller('iam/auth')
export class LogoutAllController implements BaseController<string, void> {
  constructor(
    private readonly logoutAllUseCase: LogoutAllUseCase,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiOperation({
    summary: 'Logout all sessions',
    description:
      'Revokes all active refresh tokens for the user across all devices.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 204,
    description: 'All user sessions revoked successfully',
  })
  @Post('/logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@CurrentUser('id') userId: string, @Res() res: FastifyReply) {
    await this.logoutAllUseCase.execute({ userId });

    const defaultCookieOpts = getCookieOptions(this.appConfigService.IS_HTTPS);

    res.clearCookie('access_token', defaultCookieOpts);
    res.clearCookie('refresh_token', defaultCookieOpts);

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
