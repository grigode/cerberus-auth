import {
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  type RefreshTokenDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type {
  GetActiveSessionsDto,
  UserSessionData,
} from './get-active-sessions.dto';

export class GetActiveSessionsUseCase
  implements UseCase<GetActiveSessionsDto, UserSessionData[]>
{
  constructor(
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
  ) {}

  async execute(dto: GetActiveSessionsDto): Promise<UserSessionData[]> {
    const { userId, currentRefreshToken } = dto;
    const tokens =
      await this.refreshTokenRepository.findAllActiveByUserId(userId);

    return tokens.map((token) => {
      const data = token.data;
      return {
        id: data.id,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        lastUsedAt: data.lastUsedAt,
        isCurrent: currentRefreshToken
          ? data.token === currentRefreshToken
          : false,
      };
    });
  }
}
