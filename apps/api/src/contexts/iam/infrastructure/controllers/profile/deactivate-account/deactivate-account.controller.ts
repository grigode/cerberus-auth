import { Controller, Delete, HttpCode, HttpStatus, Res } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { getCookieOptions } from '@core/shared-server';
import type { AppConfigService } from '@core/config';
import type { DeactivateAccountUseCase } from '../../../../application';
import type { Controller as BaseController } from '@core/shared-server';

import { CurrentUser } from '../../../http';

@ApiTags('IAM - Profile & Identity')
@Controller('iam/me')
export class DeactivateAccountController
  implements BaseController<string, void>
{
  constructor(
    private readonly deactivateAccountUseCase: DeactivateAccountUseCase,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiOperation({
    summary: 'Self-deactivate user account',
    description:
      'Self-deactivates the authenticated user account and revokes all active session tokens.',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 204,
    description: 'Account deactivated and sessions revoked successfully',
  })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@CurrentUser('id') userId: string, @Res() res: FastifyReply) {
    await this.deactivateAccountUseCase.execute({ userId });

    const defaultCookieOpts = getCookieOptions(this.appConfigService.IS_HTTPS);

    res.clearCookie('access_token', defaultCookieOpts);
    res.clearCookie('refresh_token', defaultCookieOpts);

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
