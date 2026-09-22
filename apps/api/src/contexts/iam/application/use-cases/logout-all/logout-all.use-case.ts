import {
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  type RefreshTokenDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { LogoutAllDto } from './logout-all.dto';

export class LogoutAllUseCase implements UseCase<LogoutAllDto, void> {
  constructor(
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
  ) {}

  async execute(dto: LogoutAllDto): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(dto.userId);
  }
}
