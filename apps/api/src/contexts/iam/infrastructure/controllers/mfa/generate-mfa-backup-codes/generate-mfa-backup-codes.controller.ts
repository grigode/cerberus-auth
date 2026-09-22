import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { GenerateMfaBackupCodesUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { MfaBackupCodesResponseDto } from './generate-mfa-backup-codes-response.dto';
import { CurrentUser } from '../../../http';

@ApiTags('IAM - MFA')
@Controller('iam/mfa')
export class GenerateMfaBackupCodesController
  implements BaseController<string, MfaBackupCodesResponseDto>
{
  constructor(
    private readonly generateMfaBackupCodesUseCase: GenerateMfaBackupCodesUseCase,
  ) {}

  @ApiOperation({
    summary: 'Generate MFA backup codes',
    description:
      'Generates 8 single-use emergency backup recovery codes for Multi-Factor Authentication.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Backup codes generated successfully',
    type: MfaBackupCodesResponseDto,
  })
  @Post('/backup-codes/regenerate')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser('id') userId: string,
  ): Promise<MfaBackupCodesResponseDto> {
    return await this.generateMfaBackupCodesUseCase.execute({ userId });
  }
}
