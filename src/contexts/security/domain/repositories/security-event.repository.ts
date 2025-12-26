import { SecurityEvent } from '../entities';

export abstract class SecurityEventRepository {
  abstract save(securityEvent: SecurityEvent): Promise<void>;
}
