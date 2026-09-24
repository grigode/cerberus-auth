import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  DEFAULT_THROTTLE_AUTH_LIMIT,
  DEFAULT_THROTTLE_AUTH_TTL_MS,
} from '@core/config';
import { AuditAction } from '@core/shared-server';
import { CreateUserUseCase } from '../../../../application';
import { ProviderVo } from '@core/domain';
import type { Controller as BaseController } from '@core/shared-server';

import { RegisterUserResponseDto } from './register-user-response.dto';
import type { RegisterUserDto } from './register-user.dto';
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
export class RegisterUserController
  implements BaseController<RegisterUserDto, RegisterUserResponseDto>
{
  constructor(private readonly createUser: CreateUserUseCase) {}

  @ApiOperation({
    summary: 'Register new user',
    description:
      'Registers a new user account with email and password, triggering email verification flow.',
  })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully',
    type: RegisterUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or email already registered',
  })
  @AuditAction({
    action: 'REGISTER_USER',
    category: 'SECURITY',
    entityName: 'User',
  })
  @Post(['/register', '/register-user'])
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @Body() data: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    await this.createUser.execute({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      provider: ProviderVo.EMAIL,
      language: data.language,
    });
    return { message: 'User account created successfully' };
  }
}
