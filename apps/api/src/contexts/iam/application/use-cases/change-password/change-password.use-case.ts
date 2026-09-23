import {
  USER_DRIVEN_PORT_TOKEN,
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  HASHING_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
  type RefreshTokenDrivenPort,
  type HashingDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { ChangePasswordDto } from './change-password.dto';
import {
  CannotReuseCurrentPasswordException,
  InvalidCredentialsException,
  UserNotFoundException,
} from '../../exceptions';

export class ChangePasswordUseCase implements UseCase<ChangePasswordDto, void> {
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
    @Inject(HASHING_DRIVEN_PORT_TOKEN)
    private readonly hashingPort: HashingDrivenPort,
  ) {}

  async execute(dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new UserNotFoundException(dto.userId);

    const isCurrentPasswordValid = await user.verifyPassword(
      dto.currentPassword,
      this.hashingPort,
    );
    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsException();
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new CannotReuseCurrentPasswordException();
    }

    const isSameAsCurrent = await this.hashingPort.compare(
      dto.newPassword,
      user.data.hashedPassword || '',
    );
    if (isSameAsCurrent) {
      throw new CannotReuseCurrentPasswordException();
    }

    const hashedPassword = await this.hashingPort.hash(dto.newPassword);
    user.updatePassword(hashedPassword);
    await this.userRepository.update(user);
    await this.refreshTokenRepository.revokeAllByUserId(dto.userId);
  }
}
