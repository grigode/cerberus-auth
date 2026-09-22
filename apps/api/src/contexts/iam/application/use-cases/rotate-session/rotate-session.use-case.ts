import datefns from 'date-fns';
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

import { InvalidRefreshTokenException } from '../../exceptions';
import type { Session } from '../create-session';
import type { RotateSessionDto } from './rotate-session.dto';

export class RotateSessionUseCase
  implements UseCase<RotateSessionDto, Session>
{
  constructor(
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
    @Inject(ACCESS_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly accessTokenService: AccessTokenDrivenPort,
  ) {}

  async execute(dto: RotateSessionDto): Promise<Session> {
    const { refreshToken } = dto;

    const tokenEntity =
      await this.refreshTokenRepository.findByToken(refreshToken);
    if (!tokenEntity) {
      throw new InvalidRefreshTokenException();
    }

    const tokenData = tokenEntity.data;

    if (tokenData.revokedAt) {
      await this.refreshTokenRepository.revokeAllByUserId(tokenData.userId);
      throw new InvalidRefreshTokenException();
    }

    if (datefns.isBefore(tokenData.expiresAt, new Date())) {
      throw new InvalidRefreshTokenException();
    }

    tokenEntity.revoke();
    await this.refreshTokenRepository.update(tokenEntity);

    const newAccessToken = await this.accessTokenService.generateAccessToken(
      tokenData.userId,
    );
    const newRefreshToken = new RefreshToken({
      userId: tokenData.userId,
      userAgent: dto.userAgent || tokenData.userAgent,
      ipAddress: dto.ipAddress || tokenData.ipAddress,
    });
    await this.refreshTokenRepository.create(newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.data.token,
    };
  }
}
