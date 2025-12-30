import {
  SecurityEvent,
  SecurityEventActorIdVo,
  SecurityEventActorTypeVo,
  SecurityEventIdVo,
  SecurityEventIpAddressVo,
  SecurityEventMetadataVo,
  SecurityEventOccurredAtVo,
  SecurityEventTargetIdVo,
  SecurityEventTargetTypeVo,
  SecurityEventTypeVo,
  SecurityEventUserAgentVo,
} from 'src/contexts/security/domain';

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

  static toDomain(dbEntity: SecurityEventDbEntity): SecurityEvent {
    return new SecurityEvent({
      id: SecurityEventIdVo.fromPersistence(dbEntity.id),
      type: SecurityEventTypeVo.fromPersistence(dbEntity.type),
      actorType: SecurityEventActorTypeVo.fromPersistence(dbEntity.actorType),
      actorId: dbEntity.actorId
        ? SecurityEventActorIdVo.fromPersistence(dbEntity.actorId)
        : null,
      targetType: dbEntity.targetType
        ? SecurityEventTargetTypeVo.fromPersistence(dbEntity.targetType)
        : null,
      targetId: dbEntity.targetId
        ? SecurityEventTargetIdVo.fromPersistence(dbEntity.targetId)
        : null,
      ipAddress: SecurityEventIpAddressVo.fromPersistence(dbEntity.ipAddress),
      userAgent: SecurityEventUserAgentVo.fromPersistence(dbEntity.userAgent),
      metadata: SecurityEventMetadataVo.fromPersistence(dbEntity.metadata),
      occurredAt: SecurityEventOccurredAtVo.fromPersistence(
        dbEntity.occurredAt,
      ),
    });
  }
}
