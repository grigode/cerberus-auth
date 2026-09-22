import {
  CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN,
  type ConfirmationTokenDrivenPort,
  USER_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { ConfirmEmailDto } from './confirm-email.dto';
import {
  ConfirmationTokenNotFoundException,
  InvalidConfirmationTokenException,
  UserInactiveException,
  UserNotFoundException,
} from '../../exceptions';

export class ConfirmEmailUseCase implements UseCase<ConfirmEmailDto, void> {
  constructor(
    @Inject(CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly confirmationTokenRepository: ConfirmationTokenDrivenPort,
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
  ) {}

  async execute(dto: ConfirmEmailDto): Promise<void> {
    const confirmationToken =
      await this.confirmationTokenRepository.findByToken(dto.token);

    if (!confirmationToken)
      throw new ConfirmationTokenNotFoundException(dto.token);

    if (!confirmationToken.isValid())
      throw new InvalidConfirmationTokenException();

    const user = await this.userRepository.findById(
      confirmationToken.data.userId,
    );

    if (!user) throw new UserNotFoundException(confirmationToken.data.userId);
    if (!user.data.isActive) throw new UserInactiveException(user.data.email);

    confirmationToken.markAsUsed();
    user.verifyEmail();

    await Promise.all([
      this.confirmationTokenRepository.update(confirmationToken),
      this.userRepository.update(user),
    ]);
  }
}
