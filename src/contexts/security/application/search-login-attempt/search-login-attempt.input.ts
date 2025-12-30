import { SortDirection } from 'src/contexts/shared/domain';

export interface LoginAttemptCriteriaInput {
  page: number;
  limit: number;
  email?: string;
  result?: boolean;
  ip?: string;
  userAgent?: string;
  failureReason?: string;
  attemptedAt?: {
    from?: Date;
    to?: Date;
  };
  sortDirection: SortDirection;
}
