import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditAction } from '@core/shared-server';
import { ChangePasswordUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { ChangePasswordResponseDto } from './change-password-response.dto';
import type { ChangePasswordDto } from './change-password.dto';
import { CurrentUser } from '../../../http';

@ApiTags('IAM - Profile & Identity')
@Controller('iam/auth')
export class ChangePasswordController
  implements BaseController<ChangePasswordDto, ChangePasswordResponseDto>
{
  constructor(private readonly changePasswordUseCase: ChangePasswordUseCase) {}

  @ApiOperation({
    summary: 'Change user password',
    description:
      'Updates account password for an authenticated user after validating current password.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    type: ChangePasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password or weak new password',
  })
  @AuditAction({
    action: 'CHANGE_PASSWORD',
    category: 'SECURITY',
    entityName: 'User',
  })
  @Post('/change-password')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    await this.changePasswordUseCase.execute({
      userId,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });

    return { message: 'Password updated successfully' };
  }
}
