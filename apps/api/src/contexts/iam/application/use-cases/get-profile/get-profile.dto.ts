import type { LanguageCode } from '@core/domain';

export interface GetProfileDto {
  userId: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  providers: string[];
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    language: LanguageCode;
  };
}
