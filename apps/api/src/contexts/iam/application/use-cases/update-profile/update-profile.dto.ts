import type { LanguageCode } from '@core/domain';

export interface UpdateProfileDto {
  userId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  language?: LanguageCode;
}
