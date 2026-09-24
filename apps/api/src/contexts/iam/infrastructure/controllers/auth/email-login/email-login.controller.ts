import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply } from 'fastify';
import { getCookieOptions } from '@core/shared-server';
import {
  type AppConfigService,
  DEFAULT_THROTTLE_AUTH_LIMIT,
  DEFAULT_THROTTLE_AUTH_TTL_MS,
} from '@core/config';
import { AuditAction } from '@core/shared-server';
import { EmailLoginUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { EmailLoginResponseDto } from './email-login-response.dto';
import type { EmailLoginDto } from './email-login.dto';
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
export class EmailLoginController
  implements BaseController<EmailLoginDto, EmailLoginResponseDto>
{
  constructor(
    private readonly emailLogin: EmailLoginUseCase,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiOperation({
    summary: 'Authenticate with credentials',
    description:
      'Authenticates user email and password. Sets HTTP-only access and refresh cookies, or returns MFA token if 2FA is active.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful or MFA required challenge returned',
    type: EmailLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or unverified email',
  })
  @AuditAction({
    action: 'EMAIL_LOGIN',
    category: 'SECURITY',
    entityName: 'User',
  })
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async handle(@Body() data: EmailLoginDto, @Res() res: FastifyReply) {
    const result = await this.emailLogin.execute({
      email: data.email,
      password: data.password,
    });

    if ('mfaRequired' in result) {
      return res.status(HttpStatus.OK).send({
        message: 'MFA required',
        mfaRequired: true,
        mfaToken: result.mfaToken,
      });
    }

    const defaultCookieOpts = getCookieOptions(this.appConfigService.IS_HTTPS);

    res.setCookie('access_token', result.accessToken, {
      ...defaultCookieOpts,
      maxAge: 60 * 15,
    });

    res.setCookie('refresh_token', result.refreshToken, {
      ...defaultCookieOpts,
      maxAge: 60 * 60 * 24 * 7,
    });

    return res.status(HttpStatus.OK).send({
      message: 'Authentication successful',
    });
  }
}
