import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  DEFAULT_THROTTLE_EMAIL_LIMIT,
  DEFAULT_THROTTLE_EMAIL_TTL_MS,
} from '@core/config';
import type { ForgotPasswordUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { ForgotPasswordResponseDto } from './forgot-password-response.dto';
import type { ForgotPasswordDto } from './forgot-password.dto';
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
export class ForgotPasswordController
  implements BaseController<ForgotPasswordDto, ForgotPasswordResponseDto>
{
  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {}

  @ApiOperation({
    summary: 'Request password reset link',
    description:
      'Generates password reset token and sends email link (anti-enumeration protected).',
  })
  @ApiResponse({
    status: 200,
    description: 'Request processed',
    type: ForgotPasswordResponseDto,
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() data: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    await this.forgotPasswordUseCase.execute(data);
    return {
      message:
        'If the email is registered, a password reset link has been sent.',
    };
  }
}
