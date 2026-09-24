import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { getCookieOptions } from '@core/shared-server';
import {
  AppConfigService,
  DEFAULT_THROTTLE_AUTH_LIMIT,
  DEFAULT_THROTTLE_AUTH_TTL_MS,
} from '@core/config';
import { VerifyMfaBackupCodeUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import type { VerifyMfaBackupCodeRequestDto } from './verify-mfa-backup-code.dto';
import { Public } from '../../../http';
import { EmailLoginResponseDto } from '../../auth/email-login/email-login-response.dto';

@ApiTags('IAM - MFA')
@Public()
@Throttle({
  auth: {
    limit: DEFAULT_THROTTLE_AUTH_LIMIT,
    ttl: DEFAULT_THROTTLE_AUTH_TTL_MS,
  },
})
@Controller('iam/mfa')
export class VerifyMfaBackupCodeController
  implements BaseController<VerifyMfaBackupCodeRequestDto, void>
{
  constructor(
    private readonly verifyMfaBackupCodeUseCase: VerifyMfaBackupCodeUseCase,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiOperation({
    summary: 'Authenticate with MFA backup code',
    description:
      'Validates a single-use emergency backup code during login challenge, consumes the code, and returns session tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful using backup code',
    type: EmailLoginResponseDto,
  })
  @Post('/verify-backup-code')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() body: VerifyMfaBackupCodeRequestDto,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const session = await this.verifyMfaBackupCodeUseCase.execute({
      mfaToken: body.mfaToken,
      code: body.code,
      userAgent,
      ipAddress,
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
      message: 'MFA backup code authenticated successfully',
    });
  }
}
