import {
  LoginAttempt,
  LoginAttemptedAtVo,
  LoginAttemptEmailVo,
  LoginAttemptFailureReason,
  LoginAttemptIdVo,
  LoginAttemptIpAddressVo,
  LoginAttemptResultVo,
  LoginAttemptUserAgentVo,
} from 'src/contexts/security/domain';

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

  static toDomain(dbEntity: LoginAttemptDbEntity): LoginAttempt {
    return new LoginAttempt({
      id: LoginAttemptIdVo.fromPersistence(dbEntity.id),
      email: LoginAttemptEmailVo.fromPersistence(dbEntity.email),
      result: LoginAttemptResultVo.fromPersistence(dbEntity.result),
      ipAddress: LoginAttemptIpAddressVo.fromPersistence(dbEntity.ipAddress),
      userAgent: LoginAttemptUserAgentVo.fromPersistence(dbEntity.userAgent),
      failureReason: dbEntity.failureReason
        ? LoginAttemptFailureReason.fromPersistence(dbEntity.failureReason)
        : null,
      attemptedAt: LoginAttemptedAtVo.fromPersistence(dbEntity.attemptedAt),
    });
  }
}
