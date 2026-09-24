import { Body, Controller, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateProfileUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { UpdateProfileResponseDto } from './update-profile-response.dto';
import type { UpdateProfileDto } from './update-profile.dto';
import { CurrentUser } from '../../../http';

@ApiTags('IAM - Profile & Identity')
@Controller('iam')
export class UpdateProfileController
  implements BaseController<UpdateProfileDto, UpdateProfileResponseDto>
{
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {}

  @ApiOperation({
    summary: 'Update user profile attributes',
    description:
      'Updates first name, last name, avatar URL, or language preference.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UpdateProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch(['/me', '/profile'])
  @HttpCode(HttpStatus.OK)
  handle(@CurrentUser('id') userId: string, @Body() data: UpdateProfileDto) {
    return this.updateProfileUseCase.execute({
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
      language: data.language,
    });
  }
}
