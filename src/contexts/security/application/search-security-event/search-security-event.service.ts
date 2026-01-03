import { LimitVo, PageVo, PaginatedResult } from 'src/contexts/shared/domain';

import { SecurityEventCriteriaInput } from './search-security-event.input';
import { SearchSecurityEventUseCase } from './search-security-event.use-case';
import {
  SecurityEvent,
  SecurityEventActorTypeVo,
  SecurityEventCriteria,
  SecurityEventIpAddressVo,
  SecurityEventOccurredAtVo,
  SecurityEventRepository,
  SecurityEventTargetTypeVo,
  SecurityEventTypeVo,
  SecurityEventUserAgentVo,
} from '../../domain';

export class SearchSecurityEventService implements SearchSecurityEventUseCase {
  constructor(private readonly repo: SecurityEventRepository) {}

  async execute(
    input: SecurityEventCriteriaInput,
  ): Promise<PaginatedResult<SecurityEvent>> {
    const criteria: SecurityEventCriteria = {
      type: input.type ? SecurityEventTypeVo.create(input.type) : undefined,
      actorType: input.actorType
        ? SecurityEventActorTypeVo.create(input.actorType)
        : undefined,
      targetType: input.targetType
        ? SecurityEventTargetTypeVo.create(input.targetType)
        : undefined,
      ip: input.ip ? SecurityEventIpAddressVo.create(input.ip) : undefined,
      userAgent: input.userAgent
        ? SecurityEventUserAgentVo.create(input.userAgent)
        : undefined,
      sort: { direction: input.sortDirection, field: 'occurredAt' },
    };

    if (input.occurredAt)
      criteria.occurredAt = {
        from: input.occurredAt.from
          ? new SecurityEventOccurredAtVo(input.occurredAt.from)
          : undefined,
        to: input.occurredAt.to
          ? new SecurityEventOccurredAtVo(input.occurredAt.to)
          : undefined,
      };

    return await this.repo.search(criteria, {
      page: new PageVo(input.page),
      limit: new LimitVo(input.limit),
    });
  }
}
