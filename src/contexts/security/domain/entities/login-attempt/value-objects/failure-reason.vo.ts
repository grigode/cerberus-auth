import { StringValueObject } from 'src/contexts/shared/domain';

export class LoginAttemptFailureReason extends StringValueObject {
  static create(value: string): LoginAttemptFailureReason {
    return this.validate.call(this, value) as LoginAttemptFailureReason;
  }
}
