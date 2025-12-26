import { RecordLoginAttemptInput } from './record-login-attempt.input';

export interface RecordLoginAttemptUseCase {
  execute(input: RecordLoginAttemptInput): Promise<void>;
}
