import { Inject } from '@nestjs/common';
import {
  LoginAttempt,
  LoginAttemptCriteria,
  LoginAttemptRepository,
} from 'src/contexts/security/domain';
import { PaginatedResult, Pagination } from 'src/contexts/shared/domain';
import { Repository } from 'typeorm';

import { LoginAttemptDbEntity } from './login-attempt.db-entity';
import { LoginAttemptMapper } from './login-attempt.mapper';

export class TypeOrmLoginAttemptRepository implements LoginAttemptRepository {
  constructor(
    @Inject(LoginAttemptDbEntity)
    private readonly repo: Repository<LoginAttemptDbEntity>,
  ) {}

  async save(attempt: LoginAttempt): Promise<void> {
    const orm = LoginAttemptMapper.toOrm(attempt);
    await this.repo.save(orm);
  }

  async search(
    criteria: LoginAttemptCriteria,
    pagination: Pagination,
  ): Promise<PaginatedResult<LoginAttempt>> {
    const { page, limit } = pagination;

    const qb = this.repo.createQueryBuilder('la');

    if (criteria.email)
      qb.andWhere('la.email = :email', { email: criteria.email.value });

    if (criteria.result !== undefined)
      qb.andWhere('la.result = :result', { result: criteria.result.value });

    if (criteria.ip) qb.andWhere('la.ip = :ip', { ip: criteria.ip.value });

    if (criteria.userAgent)
      qb.andWhere('la.userAgent LIKE :userAgent', {
        userAgent: `%${criteria.userAgent.value}%`,
      });

    if (criteria.failureReason)
      qb.andWhere('la.failureReason = :failureReason', {
        failureReason: criteria.failureReason.value,
      });

    if (criteria.attemptedAt?.from)
      qb.andWhere('la.attemptedAt >= :from', {
        from: criteria.attemptedAt.from.value,
      });

    if (criteria.attemptedAt?.to)
      qb.andWhere('la.attemptedAt <= :to', {
        to: criteria.attemptedAt.to.value,
      });

    qb.orderBy(`la.${criteria.sort.field}`, criteria.sort.direction)
      .skip((page.value - 1) * limit.value)
      .take(limit.value);

    const [rows, count] = await qb.getManyAndCount();

    return {
      count,
      pages: Math.ceil(count / limit.value),
      limit: limit.value,
      items: rows.map((row) => LoginAttemptMapper.toDomain(row)),
    };
  }
}
