import type { LanguageCode } from '@core/domain';

import type { ProviderVo } from '@core/domain';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  provider: ProviderVo;
  language?: LanguageCode;
}
