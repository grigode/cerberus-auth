import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetProfileUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { UserProfileResponseDto } from './user-profile-response.dto';
import { CurrentUser } from '../../../http';

@ApiTags('IAM - Profile & Identity')
@Controller('iam')
export class GetProfileController
  implements BaseController<string, UserProfileResponseDto>
{
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns identity and profile information for the authenticated user.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(['/me', '/profile'])
  @HttpCode(HttpStatus.OK)
  handle(@CurrentUser('id') userId: string): Promise<UserProfileResponseDto> {
    return this.getProfileUseCase.execute({ userId });
  }
}
