import { PaginatedResult } from 'src/contexts/shared/domain';

import { SecurityEventCriteriaInput } from './search-security-event.input';
import { SecurityEvent } from '../../domain';

export interface SearchSecurityEventUseCase {
  execute(
    input: SecurityEventCriteriaInput,
  ): Promise<PaginatedResult<SecurityEvent>>;
}
