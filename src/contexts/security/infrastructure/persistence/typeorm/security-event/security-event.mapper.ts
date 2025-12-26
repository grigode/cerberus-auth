import { SecurityEvent } from 'src/contexts/security/domain';
import { SecurityEventDbEntity } from './security-event.db-entity';

export class SecurityEventMapper {
  static toOrm(entity: SecurityEvent): SecurityEventDbEntity {
    const e = new SecurityEventDbEntity();
    e.id = entity.id.value;
    e.type = entity.type.value;
    e.actorType = entity.actorType.value;
    e.actorId = entity.actorId?.value ?? null;
    e.targetType = entity.targetType?.value ?? null;
    e.targetId = entity.targetId?.value ?? null;
    e.ipAddress = entity.ipAddress.value;
    e.userAgent = entity.userAgent.value;
    e.metadata = entity.metadata.toPersistence();
    e.occurredAt = entity.occurredAt.value;
    return e;
  }
}
