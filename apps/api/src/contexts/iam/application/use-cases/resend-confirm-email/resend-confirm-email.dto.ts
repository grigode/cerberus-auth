import type { LanguageCode } from '@core/domain';

export interface ResendConfirmEmailDto {
  email: string;
  language?: LanguageCode;
}
