import type { LanguageCode } from '@core/domain';

export interface SendVerificationEmailDto {
  to: string;
  name: string;
  token: string;
  language?: LanguageCode;
}
