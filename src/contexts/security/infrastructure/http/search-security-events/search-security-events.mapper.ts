import { SearchSecurityEventsQueryDto } from './search-security-events.dto';

export class SearchSecurityEventsMapper {
  static toInput(query: SearchSecurityEventsQueryDto) {
    return {
      page: Number(query.page),
      limit: Number(query.limit),
      type: query.type,
      actorType: query.actorType,
      targetType: query.targetType,
      ip: query.ip,
      userAgent: query.userAgent,
      occurredAt: {
        from: query.occurredAtFrom ? new Date(query.occurredAtFrom) : undefined,
        to: query.occurredAtTo ? new Date(query.occurredAtTo) : undefined,
      },
      sortDirection: query.sortDirection,
    };
  }
}
