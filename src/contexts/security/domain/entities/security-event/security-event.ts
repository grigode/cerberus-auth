import { JSONT } from 'src/contexts/shared/domain';

import {
  SecurityEventActorIdVo,
  SecurityEventActorTypeVo,
  SecurityEventIdVo,
  SecurityEventIpAddressVo,
  SecurityEventMetadataVo,
  SecurityEventOcurredAtVo,
  SecurityEventTargetIdVo,
  SecurityEventTargetTypeVo,
  SecurityEventTypeVo,
  SecurityEventUserAgentVo,
} from './value-objects';

export interface SecurityEventI {
  id: SecurityEventIdVo;
  type: SecurityEventTypeVo;
  actorType: SecurityEventActorTypeVo;
  actorId: SecurityEventActorIdVo | null;
  targetType: SecurityEventTargetTypeVo | null;
  targetId: SecurityEventTargetIdVo | null;
  ipAddress: SecurityEventIpAddressVo;
  userAgent: SecurityEventUserAgentVo;
  metadata: SecurityEventMetadataVo;
  occurredAt: SecurityEventOcurredAtVo;
}

export type SecurityEventCreateI = Omit<SecurityEventI, 'id' | 'ocurredAt'>;

export interface SecurityEventPrimitives {
  id: string;
  type: string;
  actorType: string;
  actorId: string | null;
  targetType: string | null;
  targetId: string | null;
  ipAddress: string;
  userAgent: string;
  metadata: JSONT;
  occurredAt: Date;
}

export class SecurityEvent implements SecurityEventI {
  id: SecurityEventIdVo;
  type: SecurityEventTypeVo;
  actorType: SecurityEventActorTypeVo;
  actorId: SecurityEventActorIdVo | null;
  targetType: SecurityEventTargetTypeVo | null;
  targetId: SecurityEventTargetIdVo | null;
  ipAddress: SecurityEventIpAddressVo;
  userAgent: SecurityEventUserAgentVo;
  metadata: SecurityEventMetadataVo;
  occurredAt: SecurityEventOcurredAtVo;

  constructor(attr: SecurityEventI) {
    this.id = attr.id;
    this.type = attr.type;
    this.actorType = attr.actorType;
    this.actorId = attr.actorId;
    this.targetType = attr.targetType;
    this.targetId = attr.targetId;
    this.ipAddress = attr.ipAddress;
    this.userAgent = attr.userAgent;
    this.metadata = attr.metadata;
    this.occurredAt = attr.occurredAt;
  }

  static create(attr: SecurityEventCreateI) {
    return new SecurityEvent({
      ...attr,
      id: SecurityEventIdVo.generate(),
      occurredAt: SecurityEventOcurredAtVo.now(),
    });
  }

  toPrimitives(): SecurityEventPrimitives {
    return {
      id: this.id.value,
      type: this.type.value,
      actorType: this.actorType.value,
      actorId: this.actorId?.value ?? null,
      targetType: this.targetType?.value ?? null,
      targetId: this.targetId?.value ?? null,
      ipAddress: this.ipAddress.value,
      userAgent: this.userAgent.value,
      metadata: this.metadata.value,
      occurredAt: this.occurredAt.value,
    };
  }
}
