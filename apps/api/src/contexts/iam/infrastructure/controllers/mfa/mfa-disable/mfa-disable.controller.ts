import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditAction } from '@core/shared-server';
import type { DisableMfaUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { MfaDisableResponseDto } from './mfa-disable-response.dto';
import type { MfaDisableDto } from './mfa-disable.dto';
import { CurrentUser } from '../../../http';

@ApiTags('IAM - Multi-Factor Authentication')
@Controller('iam/mfa')
export class MfaDisableController
  implements BaseController<MfaDisableDto, MfaDisableResponseDto>
{
  constructor(private readonly disableMfaUseCase: DisableMfaUseCase) {}

  @ApiOperation({
    summary: 'Disable MFA',
    description:
      'Deactivates MFA for the account after validating a TOTP code.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'MFA disabled successfully',
    type: MfaDisableResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code' })
  @AuditAction({
    action: 'DISABLE_MFA',
    category: 'SECURITY',
    entityName: 'User',
  })
  @Post('/disable')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser('id') userId: string,
    @Body() dto: MfaDisableDto,
  ): Promise<MfaDisableResponseDto> {
    await this.disableMfaUseCase.execute({
      userId,
      code: dto.code,
    });
    return { message: 'MFA disabled successfully' };
  }
}
