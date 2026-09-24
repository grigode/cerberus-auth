import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditAction } from '@core/shared-server';
import { EnableMfaUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { MfaEnableResponseDto } from './mfa-enable-response.dto';
import type { MfaEnableDto } from './mfa-enable.dto';
import { CurrentUser } from '../../../http';

@ApiTags('IAM - Multi-Factor Authentication')
@Controller('iam/mfa')
export class MfaEnableController
  implements BaseController<MfaEnableDto, MfaEnableResponseDto>
{
  constructor(private readonly enableMfaUseCase: EnableMfaUseCase) {}

  @ApiOperation({
    summary: 'Enable MFA',
    description:
      'Verifies initial 6-digit TOTP code and activates MFA for the account.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'MFA enabled successfully',
    type: MfaEnableResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code' })
  @AuditAction({
    action: 'ENABLE_MFA',
    category: 'SECURITY',
    entityName: 'User',
  })
  @Post('/enable')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser('id') userId: string,
    @Body() dto: MfaEnableDto,
  ): Promise<MfaEnableResponseDto> {
    await this.enableMfaUseCase.execute({
      userId,
      secret: dto.secret,
      code: dto.code,
    });
    return { message: 'MFA enabled successfully' };
  }
}
