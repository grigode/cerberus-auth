import { AuditStatus } from './audit-status.enum';
import { BaseEntity, generateUuid, type UuidVo } from '../../common';

export interface AuditLogProps {
  id?: string;
  correlationId?: string;
  userId?: string;
  action: string;
  category?: string;
  entityName?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
  details?: Record<string, unknown>;
  createdAt?: Date;
}

export class AuditLog extends BaseEntity {
  #id: UuidVo;
  #correlationId?: string;
  #userId?: string;
  #action: string;
  #category: string;
  #entityName?: string;
  #entityId?: string;
  #ipAddress?: string;
  #userAgent?: string;
  #status: AuditStatus;
  #details?: Record<string, unknown>;
  #createdAt: Date;

  constructor(props: AuditLogProps) {
    super();
    this.#id = props.id ?? generateUuid();
    this.#correlationId = props.correlationId;
    this.#userId = props.userId;
    this.#action = props.action;
    this.#category = props.category ?? 'SECURITY';
    this.#entityName = props.entityName;
    this.#entityId = props.entityId;
    this.#ipAddress = props.ipAddress;
    this.#userAgent = props.userAgent;
    this.#status = props.status ?? AuditStatus.SUCCESS;
    this.#details = props.details;
    this.#createdAt = props.createdAt ?? new Date();
  }

  get data() {
    return {
      id: this.#id,
      correlationId: this.#correlationId,
      userId: this.#userId,
      action: this.#action,
      category: this.#category,
      entityName: this.#entityName,
      entityId: this.#entityId,
      ipAddress: this.#ipAddress,
      userAgent: this.#userAgent,
      status: this.#status,
      details: this.#details,
      createdAt: this.#createdAt,
    };
  }
}
