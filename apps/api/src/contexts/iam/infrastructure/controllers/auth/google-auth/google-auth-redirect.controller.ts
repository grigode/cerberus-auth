import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply } from 'fastify';
import { nanoid } from 'nanoid';
import { getCookieOptions } from '@core/shared-server';
import {
  type AppConfigService,
  DEFAULT_THROTTLE_AUTH_LIMIT,
  DEFAULT_THROTTLE_AUTH_TTL_MS,
  type SecurityConfigService,
} from '@core/config';
import type { Controller as BaseController } from '@core/shared-server';

import { GOOGLE_ENDPOINTS } from './constants';
import { Public } from '../../../http';

@ApiTags('IAM - Authentication')
@Public()
@Throttle({
  auth: {
    limit: DEFAULT_THROTTLE_AUTH_LIMIT,
    ttl: DEFAULT_THROTTLE_AUTH_TTL_MS,
  },
})
@Controller('iam/social')
export class GoogleAuthRedirectController
  implements BaseController<void, void>
{
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly securityConfig: SecurityConfigService,
  ) {}

  @ApiOperation({
    summary: 'Redirect to Google OAuth 2.0 authorization screen',
    description:
      'Generates anti-CSRF state token and redirects to Google login.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth authorization server',
  })
  @Get('/google')
  handle(@Res() res: FastifyReply) {
    const state = nanoid(32);
    const defaultCookieOpts = getCookieOptions(this.appConfigService.IS_HTTPS);

    res.setCookie('oauth_state', state, {
      ...defaultCookieOpts,
      maxAge: 60 * 10, // 10 minutes valid
    });

    const options = {
      redirect_uri: this.securityConfig.GOOGLE_CALLBACK_URL,
      client_id: this.securityConfig.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      state,
      scope: [
        GOOGLE_ENDPOINTS.SCOPES.PROFILE,
        GOOGLE_ENDPOINTS.SCOPES.EMAIL,
      ].join(' '),
    };

    const qs = new URLSearchParams(options);
    const googleAuthUrl = `${GOOGLE_ENDPOINTS.AUTHORIZE}?${qs.toString()}`;
    res.status(302).redirect(googleAuthUrl);
  }
}
