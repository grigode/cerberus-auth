import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

export const AuditStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
} as const;

export type AuditStatus = (typeof AuditStatus)[keyof typeof AuditStatus];

@Entity('audit_logs')
export class AuditLogTypeOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ name: 'correlation_id', type: 'varchar', nullable: true })
  @Index()
  correlationId?: string;

  @Column({ name: 'user_id', type: 'varchar', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'varchar' })
  @Index()
  action!: string;

  @Column({ type: 'varchar', default: 'SECURITY' })
  category!: string;

  @Column({ name: 'entity_name', type: 'varchar', nullable: true })
  entityName?: string;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId?: string;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', default: AuditStatus.SUCCESS })
  status!: AuditStatus;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;
}
