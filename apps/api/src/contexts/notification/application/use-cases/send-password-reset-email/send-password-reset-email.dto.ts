import type { LanguageCode } from '@core/domain';

export interface SendPasswordResetEmailDto {
  to: string;
  name: string;
  token: string;
  language?: LanguageCode;
}
