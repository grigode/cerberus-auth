import { ActorTypeE, TargetTypeE } from 'src/contexts/security/domain';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'security_event' })
export class SecurityEventDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ name: 'actor_type', type: 'enum', enum: ActorTypeE })
  actorType: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: TargetTypeE,
    nullable: true,
  })
  targetType: string | null;

  @Column({ name: 'target_id', type: 'uuid', nullable: true })
  targetId: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text' })
  userAgent: string;

  @Column({ type: 'text' })
  metadata: string;

  @Column({ name: 'occurred_at', type: 'datetime' })
  occurredAt: Date;
}
