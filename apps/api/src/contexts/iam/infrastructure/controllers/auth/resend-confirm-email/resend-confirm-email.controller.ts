import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  DEFAULT_THROTTLE_EMAIL_LIMIT,
  DEFAULT_THROTTLE_EMAIL_TTL_MS,
} from '@core/config';
import { ResendConfirmationEmailUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { ResendConfirmEmailResponseDto } from './resend-confirm-email-response.dto';
import type { ResendConfirmEmailDto } from './resend-confirm-email.dto';
import { Public } from '../../../http';

@ApiTags('IAM - Authentication')
@Public()
@Throttle({
  email: {
    limit: DEFAULT_THROTTLE_EMAIL_LIMIT,
    ttl: DEFAULT_THROTTLE_EMAIL_TTL_MS,
  },
})
@Controller('iam')
export class ResendConfirmEmailController
  implements
    BaseController<ResendConfirmEmailDto, ResendConfirmEmailResponseDto>
{
  constructor(
    private readonly resendConfirmEmailUseCase: ResendConfirmationEmailUseCase,
  ) {}

  @ApiOperation({
    summary: 'Resend email confirmation token',
    description:
      'Resends email verification email (anti-enumeration protected).',
  })
  @ApiResponse({
    status: 200,
    description: 'Request processed',
    type: ResendConfirmEmailResponseDto,
  })
  @Post('resend-confirm-email')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() data: ResendConfirmEmailDto,
  ): Promise<ResendConfirmEmailResponseDto> {
    await this.resendConfirmEmailUseCase.execute(data);
    return {
      message: 'If the email is registered, a confirmation link has been sent.',
    };
  }
}
