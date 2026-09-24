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
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { getCookieOptions } from '@core/shared-server';
import {
  type AppConfigService,
  DEFAULT_THROTTLE_AUTH_LIMIT,
  DEFAULT_THROTTLE_AUTH_TTL_MS,
} from '@core/config';
import { RotateSessionUseCase } from '../../../../application';
import { InvalidRefreshTokenException } from '../../../../application/exceptions';
import type { Controller as BaseController } from '@core/shared-server';

import { RefreshTokenResponseDto } from './refresh-token-response.dto';
import { Public } from '../../../http';

@ApiTags('IAM - Authentication')
@Public()
@Throttle({
  auth: {
    limit: DEFAULT_THROTTLE_AUTH_LIMIT,
    ttl: DEFAULT_THROTTLE_AUTH_TTL_MS,
  },
})
@Controller('iam')
export class RefreshTokenController
  implements BaseController<FastifyRequest, RefreshTokenResponseDto>
{
  constructor(
    private readonly rotateSession: RotateSessionUseCase,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiOperation({
    summary: 'Rotate session tokens',
    description:
      'Rotates access and refresh tokens using the refresh_token cookie. Revokes all user sessions if token reuse is detected.',
  })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: 'Tokens rotated successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or reused refresh token',
  })
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  async handle(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    const session = await this.rotateSession.execute({ refreshToken });

    const defaultCookieOpts = getCookieOptions(this.appConfigService.IS_HTTPS);

    res.setCookie('access_token', session.accessToken, {
      ...defaultCookieOpts,
      maxAge: 60 * 15,
    });

    res.setCookie('refresh_token', session.refreshToken, {
      ...defaultCookieOpts,
      maxAge: 60 * 60 * 24 * 7,
    });

    res.status(HttpStatus.OK).send({
      message: 'Tokens rotated successfully',
    });
  }
}
