import { Inject, type UseCase } from '@core/shared-server';

import type { ResetPasswordDto } from './reset-password.dto';
import {
  PASSWORD_RESET_TOKEN_DRIVEN_PORT_TOKEN,
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  USER_DRIVEN_PORT_TOKEN,
  HASHING_DRIVEN_PORT_TOKEN,
  type PasswordResetTokenDrivenPort,
  type RefreshTokenDrivenPort,
  type UserDrivenPort,
  type HashingDrivenPort,
} from '@core/domain';
import {
  InvalidResetTokenException,
  UserInactiveException,
} from '../../exceptions';

export class ResetPasswordUseCase implements UseCase<ResetPasswordDto, void> {
  constructor(
    @Inject(PASSWORD_RESET_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly passwordResetTokenRepository: PasswordResetTokenDrivenPort,
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(REFRESH_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenDrivenPort,
    @Inject(HASHING_DRIVEN_PORT_TOKEN)
    private readonly hashingPort: HashingDrivenPort,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    if (!dto.token) {
      throw new InvalidResetTokenException();
    }

    const resetToken = await this.passwordResetTokenRepository.findByToken(
      dto.token,
    );

    if (!resetToken || !resetToken.isValid()) {
      throw new InvalidResetTokenException();
    }

    const user = await this.userRepository.findById(resetToken.data.userId);

    if (!user) {
      throw new InvalidResetTokenException();
    }

    if (!user.data.isActive) {
      throw new UserInactiveException(user.data.email);
    }

    const hashedPassword = await this.hashingPort.hash(dto.password);
    user.updatePassword(hashedPassword);
    resetToken.markAsUsed();

    await Promise.all([
      this.userRepository.update(user),
      this.passwordResetTokenRepository.update(resetToken),
      this.refreshTokenRepository.revokeAllByUserId(user.data.id),
    ]);
  }
}
