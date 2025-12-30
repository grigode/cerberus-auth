import { PaginatedResult } from 'src/contexts/shared/domain';

import { LoginAttemptCriteriaInput } from './search-login-attempt.input';
import { LoginAttempt } from '../../domain';

export interface SearchLoginAttemptUseCase {
  execute(
    input: LoginAttemptCriteriaInput,
  ): Promise<PaginatedResult<LoginAttempt>>;
}
