import {
  CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN,
  ConfirmationToken,
  type ConfirmationTokenDrivenPort,
  USER_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
  PROFILE_DRIVEN_PORT_TOKEN,
  type ProfileDrivenPort,
} from '@core/domain';
import {
  NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN,
  type NotificationQueueDriverPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import { LanguageCode } from '@core/domain';

import type { ResendConfirmEmailDto } from './resend-confirm-email.dto';
import {
  TokenNotGeneratedException,
  UserAlreadyConfirmedException,
  UserNotFoundException,
} from '../../exceptions';

export class ResendConfirmationEmailUseCase
  implements UseCase<ResendConfirmEmailDto, void>
{
  constructor(
    @Inject(CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly confirmationTokenRepository: ConfirmationTokenDrivenPort,
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(PROFILE_DRIVEN_PORT_TOKEN)
    private readonly profileRepository: ProfileDrivenPort,
    @Inject(NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN)
    private readonly notificationQueue: NotificationQueueDriverPort,
  ) {}

  async execute(dto: ResendConfirmEmailDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) throw new UserNotFoundException(dto.email);

    if (user.data.isEmailVerified)
      throw new UserAlreadyConfirmedException(dto.email);

    const newConfirmationToken = await this._generateConfirmationToken(
      user.data.id,
    );

    await this.confirmationTokenRepository.create(newConfirmationToken);

    const profile = await this.profileRepository.findByUserId(user.data.id);
    const name = profile ? profile.data.firstName : 'User';
    const language = dto.language ?? profile?.data.language ?? LanguageCode.EN;

    await this.notificationQueue.enqueueVerificationEmail({
      to: dto.email,
      name,
      token: newConfirmationToken.data.token,
      language,
    });
  }

  async _generateConfirmationToken(userId: string) {
    const maxAttempts = 5;

    for (let i = 0; i < maxAttempts; i++) {
      const newConfirmationToken = new ConfirmationToken({
        userId,
      });

      const existsConfirmationToken =
        await this.confirmationTokenRepository.verifyIfExistsByToken(
          newConfirmationToken.data.token,
        );

      if (!existsConfirmationToken) return newConfirmationToken;
    }

    throw new TokenNotGeneratedException();
  }
}
