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
  AppConfigService,
  DEFAULT_THROTTLE_AUTH_LIMIT,
  DEFAULT_THROTTLE_AUTH_TTL_MS,
} from '@core/config';
import { AuditAction } from '@core/shared-server';
import { VerifyMfaUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { MfaVerifyResponseDto } from './mfa-verify-response.dto';
import type { MfaVerifyDto } from './mfa-verify.dto';
import { Public } from '../../../http';

@ApiTags('IAM - Multi-Factor Authentication')
@Controller('iam/mfa')
export class MfaVerifyController
  implements BaseController<MfaVerifyDto, MfaVerifyResponseDto>
{
  constructor(
    private readonly verifyMfaUseCase: VerifyMfaUseCase,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiOperation({
    summary: 'Verify MFA code during login challenge',
    description:
      'Validates TOTP 6-digit code against temporary MFA challenge token and issues session cookies.',
  })
  @Public()
  @Throttle({
    auth: {
      limit: DEFAULT_THROTTLE_AUTH_LIMIT,
      ttl: DEFAULT_THROTTLE_AUTH_TTL_MS,
    },
  })
  @ApiResponse({
    status: 200,
    description: 'MFA verified and session cookies set',
    type: MfaVerifyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired TOTP code' })
  @AuditAction({
    action: 'VERIFY_MFA',
    category: 'SECURITY',
    entityName: 'User',
  })
  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  async handle(@Body() dto: MfaVerifyDto, @Res() res: FastifyReply) {
    const session = await this.verifyMfaUseCase.execute({
      mfaToken: dto.mfaToken,
      code: dto.code,
    });

    const defaultCookieOpts = getCookieOptions(this.appConfigService.IS_HTTPS);

    res.setCookie('access_token', session.accessToken, {
      ...defaultCookieOpts,
      maxAge: 60 * 15,
    });

    res.setCookie('refresh_token', session.refreshToken, {
      ...defaultCookieOpts,
      maxAge: 60 * 60 * 24 * 7,
    });

    return res.status(HttpStatus.OK).send({
      message: 'MFA verified successfully',
    });
  }
}
