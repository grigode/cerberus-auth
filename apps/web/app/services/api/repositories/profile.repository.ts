import type {
  UpdateProfileRequestDto,
  UpdateProfileResponseDto,
  UserProfileResponseDto,
} from '~/types/contracts';
import { BaseRepository } from './base.repository';

export interface IProfileRepository {
  getProfile(): Promise<UserProfileResponseDto>;
  updateProfile(
    payload: UpdateProfileRequestDto,
  ): Promise<UpdateProfileResponseDto>;
  deactivateAccount(): Promise<void>;
}

export class ProfileRepository
  extends BaseRepository
  implements IProfileRepository
{
  getProfile(): Promise<UserProfileResponseDto> {
    return this.get<UserProfileResponseDto>('/iam/me');
  }

  updateProfile(
    payload: UpdateProfileRequestDto,
  ): Promise<UpdateProfileResponseDto> {
    return this.patch<UpdateProfileResponseDto>('/iam/profile', payload);
  }

  deactivateAccount(): Promise<void> {
    return this.delete<void>('/iam/profile');
  }
}
