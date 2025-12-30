import {
  PaginatedResult,
  Pagination,
  SortBy,
} from 'src/contexts/shared/domain';

import {
  LoginAttempt,
  LoginAttemptedAtVo,
  LoginAttemptEmailVo,
  LoginAttemptFailureReason,
  LoginAttemptIpAddressVo,
  LoginAttemptResultVo,
  LoginAttemptUserAgentVo,
} from '../entities';

export type LoginAttemptSortableField = 'attemptedAt';

export interface LoginAttemptCriteria {
  email?: LoginAttemptEmailVo;
  result?: LoginAttemptResultVo;
  ip?: LoginAttemptIpAddressVo;
  userAgent?: LoginAttemptUserAgentVo;
  failureReason?: LoginAttemptFailureReason;
  attemptedAt?: {
    from?: LoginAttemptedAtVo;
    to?: LoginAttemptedAtVo;
  };
  sort: SortBy<LoginAttemptSortableField>;
}

export abstract class LoginAttemptRepository {
  abstract save(attempt: LoginAttempt): Promise<void>;

  abstract search(
    criteria: LoginAttemptCriteria,
    pagination: Pagination,
  ): Promise<PaginatedResult<LoginAttempt>>;
}
