import {
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  RefreshToken,
  type RefreshTokenDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import {
  ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
  type AccessTokenDrivenPort,
} from '@core/domain';

import type { CreateSessionDto } from './create-session.dto';

export interface Session {
  accessToken: string;
  refreshToken: string;
}

export class CreateSessionUseCase
  implements UseCase<CreateSessionDto, Session>
{
  constructor(
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
    @Inject(ACCESS_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly accessTokenService: AccessTokenDrivenPort,
  ) {}

  async execute(dto: CreateSessionDto): Promise<Session> {
    const userData = dto.user.data;

    const accessToken = await this.accessTokenService.generateAccessToken(
      userData.id,
    );
    const refreshToken = new RefreshToken({
      userId: userData.id,
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress,
    });
    await this.refreshTokenRepository.create(refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken.data.token,
    };
  }
}
