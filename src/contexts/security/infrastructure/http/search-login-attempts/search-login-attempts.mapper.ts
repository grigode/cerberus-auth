import { SearchLoginAttemptQueryDto } from './search-login-attempts.dto';

export class SearchLoginAttemptsMapper {
  static toInput(query: SearchLoginAttemptQueryDto) {
    return {
      page: Number(query.page),
      limit: Number(query.limit),
      email: query.email,
      result: query.result,
      ip: query.ip,
      userAgent: query.userAgent,
      failureReason: query.failureReason,
      attemptedAt: {
        from: query.attemptedAtFrom
          ? new Date(query.attemptedAtFrom)
          : undefined,
        to: query.attemptedAtTo ? new Date(query.attemptedAtTo) : undefined,
      },
      sortDirection: query.sortDirection,
    };
  }
}
