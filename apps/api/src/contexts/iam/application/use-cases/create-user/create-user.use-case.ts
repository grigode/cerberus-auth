import {
  NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN,
  type NotificationQueueDriverPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import { LanguageCode } from '@core/domain';

import type { CreateUserDto } from './create-user.dto';
import {
  CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN,
  ConfirmationToken,
  Profile,
  PROFILE_DRIVEN_PORT_TOKEN,
  ProviderVo,
  RoleVo,
  User,
  USER_DRIVEN_PORT_TOKEN,
  HASHING_DRIVEN_PORT_TOKEN,
  type HashingDrivenPort,
  type ProfileDrivenPort,
  type ConfirmationTokenDrivenPort,
  type UserDrivenPort,
} from '@core/domain';
import {
  PasswordIsRequiredException,
  UserAlreadyExistsException,
  TokenNotGeneratedException,
} from '../../exceptions';

export class CreateUserUseCase implements UseCase<CreateUserDto, void> {
  constructor(
    @Inject(CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly confirmationTokenRepository: ConfirmationTokenDrivenPort,
    @Inject(PROFILE_DRIVEN_PORT_TOKEN)
    private readonly profileRepository: ProfileDrivenPort,
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN)
    private readonly notificationQueue: NotificationQueueDriverPort,
    @Inject(HASHING_DRIVEN_PORT_TOKEN)
    private readonly hashingPort: HashingDrivenPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<void> {
    if (dto.provider === ProviderVo.EMAIL && !dto.password)
      throw new PasswordIsRequiredException();

    const userExists = await this.userRepository.verifyIfExistsByEmail(
      dto.email,
    );

    if (userExists) throw new UserAlreadyExistsException(dto.email);

    const newUser = new User({
      email: dto.email,
      providers: new Set([dto.provider]),
      role: RoleVo.USER,
      isEmailVerified: dto.provider !== ProviderVo.EMAIL,
    });
    if (dto.password) {
      const hashedPassword = await this.hashingPort.hash(dto.password);
      newUser.updatePassword(hashedPassword);
    }

    const newProfile = new Profile({
      userId: newUser.data.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      language: dto.language ?? LanguageCode.EN,
    });

    const newConfirmationToken = await this._generateConfirmationToken(
      newUser.data.id,
    );

    // Before profile and confirmationToken
    await this.userRepository.create(newUser);

    await Promise.all([
      this.profileRepository.create(newProfile),
      this.confirmationTokenRepository.create(newConfirmationToken),
    ]);

    if (dto.provider === ProviderVo.EMAIL) {
      await this.notificationQueue.enqueueVerificationEmail({
        to: dto.email,
        name: dto.firstName,
        token: newConfirmationToken.data.token,
        language: newProfile.data.language,
      });
    }
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
