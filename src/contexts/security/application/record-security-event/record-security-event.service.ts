import { RecordSecurityEventInput } from './record-security-event.input';
import { RecordSecurityEventUseCase } from './record-security-event.use-case';
import {
  SecurityEvent,
  SecurityEventActorIdVo,
  SecurityEventActorTypeVo,
  SecurityEventIpAddressVo,
  SecurityEventMetadataVo,
  SecurityEventRepository,
  SecurityEventTargetIdVo,
  SecurityEventTargetTypeVo,
  SecurityEventTypeVo,
  SecurityEventUserAgentVo,
} from '../../domain';

export class RecordSecurityEventService implements RecordSecurityEventUseCase {
  constructor(private readonly repo: SecurityEventRepository) {}

  async execute(input: RecordSecurityEventInput): Promise<void> {
    const event = SecurityEvent.create({
      type: SecurityEventTypeVo.create(input.type),
      actorType: SecurityEventActorTypeVo.create(input.actorType),
      actorId: input.actorId
        ? SecurityEventActorIdVo.create(input.actorId)
        : null,
      targetType: input.targetType
        ? SecurityEventTargetTypeVo.create(input.targetType)
        : null,
      targetId: input.targetId
        ? SecurityEventTargetIdVo.create(input.targetId)
        : null,
      ipAddress: SecurityEventIpAddressVo.create(input.ip),
      userAgent: SecurityEventUserAgentVo.create(input.userAgent),
      metadata: SecurityEventMetadataVo.create(input.metadata),
    });

    await this.repo.save(event);
  }
}
