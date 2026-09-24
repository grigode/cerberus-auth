import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { getCookieOptions } from '@core/shared-server';
import { AppConfigService } from '@core/config';
import { LogoutUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { Public } from '../../../http';

@ApiTags('IAM - Authentication')
@Public()
@Controller('iam')
export class LogoutController implements BaseController<void, void> {
  constructor(
    private readonly logoutUseCase: LogoutUseCase,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiOperation({
    summary: 'Logout current session',
    description:
      'Revokes the current refresh token and clears authentication cookies.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const refreshToken = req.cookies?.refresh_token;

    await this.logoutUseCase.execute({ refreshToken });

    const defaultCookieOpts = getCookieOptions(this.appConfigService.IS_HTTPS);

    res.clearCookie('access_token', defaultCookieOpts);
    res.clearCookie('refresh_token', defaultCookieOpts);

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
