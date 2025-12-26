import { RecordLoginAttemptInput } from './record-login-attempt.input';
import { RecordLoginAttemptUseCase } from './record-login-attempt.use-case';
import {
  LoginAttempt,
  LoginAttemptEmailVo,
  LoginAttemptFailureReason,
  LoginAttemptIpAddressVo,
  LoginAttemptRepository,
  LoginAttemptResultVo,
  LoginAttemptUserAgentVo,
} from '../../domain';

export class RecordLoginAttemptService implements RecordLoginAttemptUseCase {
  constructor(private readonly repo: LoginAttemptRepository) {}

  async execute(input: RecordLoginAttemptInput): Promise<void> {
    const attempt = LoginAttempt.create({
      email: LoginAttemptEmailVo.create(input.email),
      result: LoginAttemptResultVo.create(input.result),
      ipAddress: LoginAttemptIpAddressVo.create(input.ip),
      userAgent: LoginAttemptUserAgentVo.create(input.userAgent),
      failureReason: input.failureReason
        ? LoginAttemptFailureReason.create(input.failureReason)
        : null,
    });

    await this.repo.save(attempt);
  }
}
