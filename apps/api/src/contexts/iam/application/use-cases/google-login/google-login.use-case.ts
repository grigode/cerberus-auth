import { Inject, type UseCase } from '@core/shared-server';

import {
  ProviderVo,
  RoleVo,
  User,
  Profile,
  USER_DRIVEN_PORT_TOKEN,
  PROFILE_DRIVEN_PORT_TOKEN,
  ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
  type ProfileDrivenPort,
  type AccessTokenDrivenPort,
} from '@core/domain';
import { UserInactiveException } from '../../exceptions';
import type { CreateSessionUseCase, Session } from '../create-session';
import type { GoogleLoginDto } from './google-login.dto';

export type GoogleLoginResult =
  | Session
  | { mfaRequired: true; mfaToken: string };

export class GoogleLoginUseCase
  implements UseCase<GoogleLoginDto, GoogleLoginResult>
{
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(PROFILE_DRIVEN_PORT_TOKEN)
    private readonly profileRepository: ProfileDrivenPort,
    private readonly createSessionUseCase: CreateSessionUseCase,
    @Inject(ACCESS_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly accessTokenService: AccessTokenDrivenPort,
  ) {}

  async execute(dto: GoogleLoginDto): Promise<GoogleLoginResult> {
    let user = await this.userRepository.findByEmail(dto.email);

    if (user) {
      const userData = user.data;
      if (!userData.isActive) {
        throw new UserInactiveException(dto.email);
      }

      if (!userData.providers.has(ProviderVo.GOOGLE)) {
        user.addProvider(ProviderVo.GOOGLE);
      }

      if (!userData.isEmailVerified) {
        user.verifyEmail();
      }

      if (user.hasChanges()) {
        await this.userRepository.update(user);
      }
    } else {
      user = new User({
        email: dto.email,
        providers: new Set([ProviderVo.GOOGLE]),
        role: RoleVo.USER,
        isEmailVerified: true,
      });

      const profile = new Profile({
        userId: user.data.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });

      await this.userRepository.create(user);
      await this.profileRepository.create(profile);
    }

    user.updateLastLoginAt();
    await this.userRepository.update(user);

    if (user.data.isMfaEnabled) {
      const mfaToken = await this.accessTokenService.generateAccessToken(
        user.data.id,
        { mfaPending: true },
      );
      return { mfaRequired: true, mfaToken };
    }

    return await this.createSessionUseCase.execute({ user });
  }
}
