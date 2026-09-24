import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  DEFAULT_THROTTLE_AUTH_LIMIT,
  DEFAULT_THROTTLE_AUTH_TTL_MS,
} from '@core/config';
import { ResetPasswordUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { ResetPasswordResponseDto } from './reset-password-response.dto';
import type { ResetPasswordDto } from './reset-password.dto';
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
export class ResetPasswordController
  implements BaseController<ResetPasswordDto, ResetPasswordResponseDto>
{
  constructor(private readonly resetPasswordUseCase: ResetPasswordUseCase) {}

  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Resets user account password using a valid reset token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() data: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    await this.resetPasswordUseCase.execute(data);
    return { message: 'Password reset successfully' };
  }
}
