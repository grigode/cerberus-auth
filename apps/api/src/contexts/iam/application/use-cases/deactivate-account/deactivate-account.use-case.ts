import {
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  type RefreshTokenDrivenPort,
  USER_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { DeactivateAccountDto } from './deactivate-account.dto';
import { UserNotFoundException } from '../../exceptions';

export class DeactivateAccountUseCase
  implements UseCase<DeactivateAccountDto, void>
{
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
  ) {}

  async execute(dto: DeactivateAccountDto): Promise<void> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new UserNotFoundException(dto.userId);

    user.toggleIsActive();
    await this.userRepository.update(user);
    await this.refreshTokenRepository.revokeAllByUserId(dto.userId);
  }
}
