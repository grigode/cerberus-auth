import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InAppNotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SYSTEM = 'SYSTEM',
}

@Entity({ name: 'in_app_notifications' })
@Index(['userId', 'createdAt'])
@Index(['userId', 'isRead'])
export class InAppNotificationTypeOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  @Index()
  userId!: string;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: false })
  title!: string;

  @Column({ name: 'message', type: 'text', nullable: false })
  message!: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: InAppNotificationType,
    default: InAppNotificationType.INFO,
  })
  type!: InAppNotificationType;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data?: Record<string, unknown>;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
