import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { SetupMfaUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { MfaSetupResponseDto } from './mfa-setup-response.dto';
import { CurrentUser } from '../../../http';

@ApiTags('IAM - Multi-Factor Authentication')
@Controller('iam/mfa')
export class MfaSetupController
  implements BaseController<string, MfaSetupResponseDto>
{
  constructor(private readonly setupMfaUseCase: SetupMfaUseCase) {}

  @ApiOperation({
    summary: 'Generate TOTP secret and QR code for MFA setup',
    description:
      'Initiates 2FA enrollment by returning a secret key, OTPAuth URI, and base64 QR code image.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'MFA setup initialized successfully',
    type: MfaSetupResponseDto,
  })
  @Post('/setup')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser('id') userId: string,
  ): Promise<MfaSetupResponseDto> {
    return this.setupMfaUseCase.execute({ userId });
  }
}
