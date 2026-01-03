import { SortDirection } from 'src/contexts/shared/domain';

export interface SecurityEventCriteriaInput {
  page: number;
  limit: number;
  type?: string;
  actorType?: string;
  targetType?: string;
  ip?: string;
  userAgent?: string;
  occurredAt?: {
    from?: Date;
    to?: Date;
  };
  sortDirection: SortDirection;
}
