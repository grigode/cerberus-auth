import { LoginAttempt } from 'src/contexts/security/domain';

import { LoginAttemptDbEntity } from './login-attempt.db-entity';

export class LoginAttemptMapper {
  static toOrm(entity: LoginAttempt): LoginAttemptDbEntity {
    const e = new LoginAttemptDbEntity();
    e.id = entity.id.value;
    e.email = entity.email.value;
    e.result = entity.result.value;
    e.ipAddress = entity.ipAddress.value;
    e.userAgent = entity.userAgent.value;
    e.failureReason = entity.failureReason?.value ?? null;
    e.attemptedAt = entity.attemptedAt.value;
    return e;
  }
}
