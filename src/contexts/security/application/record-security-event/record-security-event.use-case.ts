import { RecordSecurityEventInput } from './record-security-event.input';

export interface RecordSecurityEventUseCase {
  execute(input: RecordSecurityEventInput): Promise<void>;
}
