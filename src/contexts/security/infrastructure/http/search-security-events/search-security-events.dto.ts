import { SortDirection } from 'src/contexts/shared/domain';

export class SearchSecurityEventsQueryDto {
  page: number;
  limit: number;
  type?: string;
  actorType?: string;
  targetType?: string;
  ip?: string;
  userAgent?: string;
  occurredAtFrom?: string;
  occurredAtTo?: string;
  sortDirection: SortDirection;
}
