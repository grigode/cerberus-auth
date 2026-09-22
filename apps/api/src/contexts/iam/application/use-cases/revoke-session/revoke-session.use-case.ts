import { InvalidRefreshTokenException } from '../../../application/exceptions';
import {
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  type RefreshTokenDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { RevokeSessionDto } from './revoke-session.dto';

export class RevokeSessionUseCase implements UseCase<RevokeSessionDto, void> {
  constructor(
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
  ) {}

  async execute(dto: RevokeSessionDto): Promise<void> {
    const { userId, sessionId } = dto;
    const session = await this.refreshTokenRepository.findById(sessionId);

    if (!session) {
      return;
    }

    if (session.data.userId !== userId) {
      throw new InvalidRefreshTokenException();
    }

    session.revoke();
    await this.refreshTokenRepository.update(session);
  }
}
