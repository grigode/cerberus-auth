import { LoginAttempt } from '../entities';

export abstract class LoginAttemptRepository {
  abstract save(attempt: LoginAttempt): Promise<void>;
}
