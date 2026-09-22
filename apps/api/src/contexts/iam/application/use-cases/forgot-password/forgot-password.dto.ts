import type { LanguageCode } from '@core/domain';

export interface ForgotPasswordDto {
  email: string;
  language?: LanguageCode;
}
