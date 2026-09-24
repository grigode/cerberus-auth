import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  DEFAULT_THROTTLE_EMAIL_LIMIT,
  DEFAULT_THROTTLE_EMAIL_TTL_MS,
} from '@core/config';
import { AuditAction } from '@core/shared-server';
import { ConfirmEmailUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { ConfirmEmailResponseDto } from './confirm-email-response.dto';
import type { ConfirmEmailQueryDto } from './confirm-email.dto';
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
export class ConfirmEmailController
  implements BaseController<ConfirmEmailQueryDto, ConfirmEmailResponseDto>
{
  constructor(private readonly confirmEmail: ConfirmEmailUseCase) {}

  @ApiOperation({
    summary: 'Confirm user email address',
    description:
      'Validates email confirmation token and marks user email as verified.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email address confirmed successfully',
    type: ConfirmEmailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired confirmation token',
  })
  @AuditAction({
    action: 'CONFIRM_EMAIL',
    category: 'SECURITY',
    entityName: 'User',
  })
  @Get('/confirm-email')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Query() query: ConfirmEmailQueryDto,
  ): Promise<ConfirmEmailResponseDto> {
    await this.confirmEmail.execute({ token: query.token });
    return { message: 'Email address confirmed successfully' };
  }
}
