import { Inject, type UseCase } from '@core/shared-server';

import type { GetProfileDto, UserProfileResponse } from './get-profile.dto';
import {
  PROFILE_DRIVEN_PORT_TOKEN,
  USER_DRIVEN_PORT_TOKEN,
  type ProfileDrivenPort,
  type UserDrivenPort,
} from '@core/domain';
import {
  ProfileNotFoundException,
  UserNotFoundException,
} from '../../exceptions';

export class GetProfileUseCase
  implements UseCase<GetProfileDto, UserProfileResponse>
{
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(PROFILE_DRIVEN_PORT_TOKEN)
    private readonly profileRepository: ProfileDrivenPort,
  ) {}

  async execute(dto: GetProfileDto): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new UserNotFoundException(dto.userId);

    const profile = await this.profileRepository.findByUserId(dto.userId);
    if (!profile) throw new ProfileNotFoundException(dto.userId);

    const userData = user.data;
    const profileData = profile.data;

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      isActive: userData.isActive,
      isEmailVerified: userData.isEmailVerified,
      isMfaEnabled: userData.isMfaEnabled,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLoginAt: userData.lastLoginAt,
      providers: Array.from(userData.providers),
      profile: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatarUrl: profileData.avatarUrl,
        language: profileData.language,
      },
    };
  }
}
