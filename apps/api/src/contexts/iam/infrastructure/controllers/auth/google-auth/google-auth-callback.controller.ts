import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { getCookieOptions } from '@core/shared-server';
import {
  type AppConfigService,
  DEFAULT_THROTTLE_AUTH_LIMIT,
  DEFAULT_THROTTLE_AUTH_TTL_MS,
  type SecurityConfigService,
} from '@core/config';
import type { GoogleLoginUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { GOOGLE_ENDPOINTS } from './constants';
import type { GoogleAuthCallbackQueryDto } from './google-auth-callback.dto';
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
export class GoogleAuthCallbackController
  implements BaseController<GoogleAuthCallbackQueryDto, void>
{
  private readonly logger = new Logger(GoogleAuthCallbackController.name);

  constructor(
    private readonly googleLogin: GoogleLoginUseCase,
    private readonly appConfigService: AppConfigService,
    private readonly securityConfig: SecurityConfigService,
  ) {}

  @ApiOperation({
    summary: 'Google OAuth 2.0 callback endpoint',
    description:
      'Validates anti-CSRF state, exchanges authorization code for Google profile, creates/links user, and sets session cookies.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend application',
  })
  @Get('/google/callback')
  async handle(
    @Query() query: GoogleAuthCallbackQueryDto,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const { code, state } = query;
    const frontendUrl = this.securityConfig.GOOGLE_REDIRECT_FRONTEND_URL;
    const defaultCookieOpts = getCookieOptions(this.appConfigService.IS_HTTPS);

    try {
      if (!code) {
        throw new Error('Authorization code missing');
      }

      // CSRF State validation (OWASP ASVS V3 / NIST SP 800-63B)
      const savedState = req.cookies?.oauth_state;
      if (!savedState || !state || savedState !== state) {
        throw new Error('Invalid OAuth state parameter (Possible CSRF attack)');
      }

      res.clearCookie('oauth_state', defaultCookieOpts);

      // 1. Exchange authorization code for access token
      const tokenResponse = await fetch(GOOGLE_ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.securityConfig.GOOGLE_CLIENT_ID,
          client_secret: this.securityConfig.GOOGLE_CLIENT_SECRET,
          redirect_uri: this.securityConfig.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to exchange token with Google: ${errorText}`);
      }

      const tokenJson = (await tokenResponse.json()) as {
        access_token: string;
      };
      const { access_token } = tokenJson;

      // 2. Fetch user profile from google
      const profileResponse = await fetch(GOOGLE_ENDPOINTS.USER_INFO, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        throw new Error(`Failed to fetch userinfo from Google: ${errorText}`);
      }

      const profile = (await profileResponse.json()) as {
        email: string;
        given_name?: string;
        family_name?: string;
      };
      const { email, given_name, family_name } = profile;

      if (!email) {
        throw new Error('Email not returned by Google');
      }

      // 3. Login or link account or create user
      const result = await this.googleLogin.execute({
        email,
        firstName: given_name || 'Google',
        lastName: family_name || 'User',
      });

      if ('mfaRequired' in result) {
        return res
          .status(302)
          .redirect(
            `${frontendUrl}/auth/mfa?token=${encodeURIComponent(result.mfaToken)}`,
          );
      }

      // 4. Set cookies
      res.setCookie('access_token', result.accessToken, {
        ...defaultCookieOpts,
        maxAge: 60 * 15,
      });

      res.setCookie('refresh_token', result.refreshToken, {
        ...defaultCookieOpts,
        maxAge: 60 * 60 * 24 * 7,
      });

      // 5. Redirect to frontend
      res.status(302).redirect(frontendUrl);
    } catch (error: unknown) {
      this.logger.error(
        `Google OAuth Error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      res.clearCookie('oauth_state', defaultCookieOpts);
      const errorMsg = encodeURIComponent(
        error instanceof Error ? error.message : 'Google authentication failed',
      );
      res.status(302).redirect(`${frontendUrl}/auth/error?message=${errorMsg}`);
    }
  }
}
