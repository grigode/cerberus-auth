import { SortDirection } from 'src/contexts/shared/domain';

export class SearchLoginAttemptQueryDto {
  page: number;
  limit: number;
  email?: string;
  result?: boolean;
  ip?: string;
  userAgent?: string;
  failureReason?: string;
  attemptedAtFrom?: string;
  attemptedAtTo?: string;
  sortDirection: SortDirection;
}
