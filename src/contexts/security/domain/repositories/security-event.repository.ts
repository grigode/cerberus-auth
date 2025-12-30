import {
  PaginatedResult,
  Pagination,
  SortBy,
} from 'src/contexts/shared/domain';

import {
  SecurityEvent,
  SecurityEventActorTypeVo,
  SecurityEventIpAddressVo,
  SecurityEventOccurredAtVo,
  SecurityEventTargetTypeVo,
  SecurityEventTypeVo,
  SecurityEventUserAgentVo,
} from '../entities';

export type SecurityEventSortableField = 'occurredAt';

export interface SecurityEventCriteria {
  type?: SecurityEventTypeVo;
  actorType?: SecurityEventActorTypeVo;
  targetType?: SecurityEventTargetTypeVo;
  ip?: SecurityEventIpAddressVo;
  userAgent?: SecurityEventUserAgentVo;
  occurredAt?: {
    from?: SecurityEventOccurredAtVo;
    to?: SecurityEventOccurredAtVo;
  };
  sort: SortBy<SecurityEventSortableField>;
}

export abstract class SecurityEventRepository {
  abstract save(securityEvent: SecurityEvent): Promise<void>;

  abstract search(
    criteria: SecurityEventCriteria,
    pagination: Pagination,
  ): Promise<PaginatedResult<SecurityEvent>>;
}
