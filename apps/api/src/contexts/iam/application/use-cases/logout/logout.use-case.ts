import {
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  type RefreshTokenDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { LogoutDto } from './logout.dto';

export class LogoutUseCase implements UseCase<LogoutDto, void> {
  constructor(
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
  ) {}

  async execute(dto: LogoutDto): Promise<void> {
    const { refreshToken } = dto;
    if (!refreshToken) {
      return;
    }

    const tokenEntity =
      await this.refreshTokenRepository.findByToken(refreshToken);
    if (!tokenEntity) {
      return;
    }

    const tokenData = tokenEntity.data;
    if (tokenData.revokedAt) {
      return;
    }

    tokenEntity.revoke();
    await this.refreshTokenRepository.update(tokenEntity);
  }
}
