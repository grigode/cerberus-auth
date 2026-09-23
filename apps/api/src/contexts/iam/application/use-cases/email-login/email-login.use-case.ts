import {
  ProviderVo,
  USER_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import {
  ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
  HASHING_DRIVEN_PORT_TOKEN,
  type AccessTokenDrivenPort,
  type HashingDrivenPort,
} from '@core/domain';

import type { EmailLoginDto } from './email-login.dto';
import {
  EmailNotVerifiedException,
  InvalidCredentialsException,
  UserInactiveException,
} from '../../exceptions';
import type { CreateSessionUseCase, Session } from '../create-session';

export type EmailLoginResult =
  | Session
  | { mfaRequired: true; mfaToken: string };

export class EmailLoginUseCase
  implements UseCase<EmailLoginDto, EmailLoginResult>
{
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(ACCESS_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly accessTokenService: AccessTokenDrivenPort,
    @Inject(HASHING_DRIVEN_PORT_TOKEN)
    private readonly hashingPort: HashingDrivenPort,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(dto: EmailLoginDto): Promise<EmailLoginResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new InvalidCredentialsException();

    if (user.isLockedOut()) {
      throw new InvalidCredentialsException(
        'Account locked due to consecutive failed login attempts. Please try again later.',
      );
    }

    const userData = user.data;

    if (!userData.isActive) throw new UserInactiveException(dto.email);

    if (!userData.isEmailVerified)
      throw new EmailNotVerifiedException(dto.email);

    if (!userData.providers.has(ProviderVo.EMAIL))
      throw new InvalidCredentialsException();

    const isPasswordValid = await user.verifyPassword(
      dto.password,
      this.hashingPort,
    );
    if (!isPasswordValid) {
      user.incrementFailedLogin();
      await this.userRepository.update(user);
      throw new InvalidCredentialsException();
    }

    user.resetFailedLogin();
    user.updateLastLoginAt();
    await this.userRepository.update(user);

    if (userData.isMfaEnabled) {
      const mfaToken = await this.accessTokenService.generateAccessToken(
        userData.id,
        { mfaPending: true },
      );
      return { mfaRequired: true, mfaToken };
    }

    return await this.createSessionUseCase.execute({
      user,
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress,
    });
  }
}
