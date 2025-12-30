import { LimitVo, PageVo, PaginatedResult } from 'src/contexts/shared/domain';

import { LoginAttemptCriteriaInput } from './search-login-attempt.input';
import { SearchLoginAttemptUseCase } from './search-login-attempt.use-case';
import {
  LoginAttempt,
  LoginAttemptCriteria,
  LoginAttemptedAtVo,
  LoginAttemptEmailVo,
  LoginAttemptFailureReason,
  LoginAttemptIpAddressVo,
  LoginAttemptRepository,
  LoginAttemptResultVo,
  LoginAttemptUserAgentVo,
} from '../../domain';

export class SearchLoginAttemptService implements SearchLoginAttemptUseCase {
  constructor(private readonly repo: LoginAttemptRepository) {}

  async execute(
    input: LoginAttemptCriteriaInput,
  ): Promise<PaginatedResult<LoginAttempt>> {
    const criteria: LoginAttemptCriteria = {
      email: input.email ? LoginAttemptEmailVo.create(input.email) : undefined,
      result: input.result
        ? LoginAttemptResultVo.create(input.result)
        : undefined,
      ip: input.ip ? LoginAttemptIpAddressVo.create(input.ip) : undefined,
      userAgent: input.userAgent
        ? LoginAttemptUserAgentVo.create(input.userAgent)
        : undefined,
      failureReason: input.failureReason
        ? LoginAttemptFailureReason.create(input.failureReason)
        : undefined,
      sort: { direction: input.sortDirection, field: 'attemptedAt' },
    };

    if (input.attemptedAt)
      criteria.attemptedAt = {
        from: input.attemptedAt.from
          ? new LoginAttemptedAtVo(input.attemptedAt.from)
          : undefined,
        to: input.attemptedAt.to
          ? new LoginAttemptedAtVo(input.attemptedAt.to)
          : undefined,
      };

    return await this.repo.search(criteria, {
      page: new PageVo(input.page),
      limit: new LimitVo(input.limit),
    });
  }
}
