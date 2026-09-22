import {
  NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN,
  type NotificationQueueDriverPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import { LanguageCode, type UuidVo } from '@core/domain';

import type { ForgotPasswordDto } from './forgot-password.dto';
import {
  PASSWORD_RESET_TOKEN_DRIVEN_PORT_TOKEN,
  PasswordResetToken,
  type PasswordResetTokenDrivenPort,
  USER_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
  PROFILE_DRIVEN_PORT_TOKEN,
  type ProfileDrivenPort,
  ProviderVo,
} from '@core/domain';
import { TokenNotGeneratedException } from '../../exceptions';

export class ForgotPasswordUseCase implements UseCase<ForgotPasswordDto, void> {
  constructor(
    @Inject(PASSWORD_RESET_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly passwordResetTokenRepository: PasswordResetTokenDrivenPort,
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(PROFILE_DRIVEN_PORT_TOKEN)
    private readonly profileRepository: ProfileDrivenPort,
    @Inject(NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN)
    private readonly notificationQueue: NotificationQueueDriverPort,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);

    // To prevent account enumeration, we do not throw any exceptions
    // if the user is not found or does not support email login provider.
    if (!user || !user.data.providers.has(ProviderVo.EMAIL)) {
      return;
    }

    const newPasswordResetToken = await this._generatePasswordResetToken(
      user.data.id,
    );

    await this.passwordResetTokenRepository.create(newPasswordResetToken);

    const profile = await this.profileRepository.findByUserId(user.data.id);
    const name = profile ? `${profile.data.firstName}` : 'User';
    const language = dto.language ?? profile?.data.language ?? LanguageCode.EN;

    await this.notificationQueue.enqueuePasswordResetEmail({
      to: dto.email,
      name,
      token: newPasswordResetToken.data.token,
      language,
    });
  }

  async _generatePasswordResetToken(userId: UuidVo) {
    const maxAttempts = 5;

    for (let i = 0; i < maxAttempts; i++) {
      const token = new PasswordResetToken({
        userId,
      });

      const existsToken =
        await this.passwordResetTokenRepository.verifyIfExistsByToken(
          token.data.token,
        );

      if (!existsToken) return token;
    }

    throw new TokenNotGeneratedException();
  }
}
