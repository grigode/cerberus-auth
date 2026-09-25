import type { LanguageCodeVo } from '@core/domain';
import type { AuthProvider, UserRole } from './auth.contract';

// ----------------------------------------------------
// User Profile & Identity Contracts
// ----------------------------------------------------

export interface UserProfileDetailsDto {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  language?: `${LanguageCodeVo}` | string;
}

export interface UserProfileResponseDto {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  profile: UserProfileDetailsDto;
  providers: AuthProvider[];
}

export interface UpdateProfileRequestDto {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  language?: `${LanguageCodeVo}` | string;
}

export type UpdateProfileResponseDto = UserProfileResponseDto;

export interface ActiveSessionDto {
  id: string;
  ipAddress: string;
  userAgent: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface RevokeSessionResponseDto {
  message: string;
}
