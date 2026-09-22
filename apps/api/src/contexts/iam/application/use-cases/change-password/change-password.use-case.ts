import { USER_DRIVEN_PORT_TOKEN, type UserDrivenPort } from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { ChangePasswordDto } from './change-password.dto';
import {
  InvalidCredentialsException,
  UserNotFoundException,
} from '../../exceptions';

export class ChangePasswordUseCase implements UseCase<ChangePasswordDto, void> {
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
  ) {}

  async execute(dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new UserNotFoundException(dto.userId);

    const isCurrentPasswordValid = await user.verifyPassword(
      dto.currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsException();
    }

    await user.updatePassword(dto.newPassword);
    await this.userRepository.update(user);
  }
}
