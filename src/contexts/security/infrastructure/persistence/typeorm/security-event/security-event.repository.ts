import { Inject } from '@nestjs/common';
import {
  SecurityEvent,
  SecurityEventCriteria,
  SecurityEventRepository,
} from 'src/contexts/security/domain';
import { PaginatedResult, Pagination } from 'src/contexts/shared/domain';
import { Repository } from 'typeorm';

import { SecurityEventDbEntity } from './security-event.db-entity';
import { SecurityEventMapper } from './security-event.mapper';

export class TypeOrmSecurityEventRepository implements SecurityEventRepository {
  constructor(
    @Inject(SecurityEventDbEntity)
    private readonly repo: Repository<SecurityEventDbEntity>,
  ) {}

  async save(securityEvent: SecurityEvent): Promise<void> {
    const orm = SecurityEventMapper.toOrm(securityEvent);
    await this.repo.save(orm);
  }

  async search(
    criteria: SecurityEventCriteria,
    pagination: Pagination,
  ): Promise<PaginatedResult<SecurityEvent>> {
    const { page, limit } = pagination;

    const qb = this.repo.createQueryBuilder('se');

    if (criteria.type)
      qb.andWhere('se.type = :type', { type: criteria.type.value });

    if (criteria.actorType)
      qb.andWhere('se.actorType = :actorType', {
        actorType: criteria.actorType.value,
      });

    if (criteria.targetType)
      qb.andWhere('se.targetType = :targetType', {
        targetType: criteria.targetType.value,
      });

    if (criteria.ip) qb.andWhere('se.ip = :ip', { ip: criteria.ip.value });

    if (criteria.userAgent)
      qb.andWhere('se.userAgent LIKE :userAgent', {
        userAgent: `%${criteria.userAgent.value}%`,
      });

    if (criteria.occurredAt?.from)
      qb.andWhere('se.occurredAt >= :from', {
        from: criteria.occurredAt.from.value,
      });

    if (criteria.occurredAt?.to)
      qb.andWhere('se.occurredAt <= :to', {
        to: criteria.occurredAt.to.value,
      });

    qb.orderBy(`se.${criteria.sort.field}`, criteria.sort.direction)
      .skip((page.value - 1) * limit.value)
      .take(limit.value);

    const [rows, count] = await qb.getManyAndCount();

    return {
      count,
      pages: Math.ceil(count / limit.value),
      limit: limit.value,
      items: rows.map((row) => SecurityEventMapper.toDomain(row)),
    };
  }
}
