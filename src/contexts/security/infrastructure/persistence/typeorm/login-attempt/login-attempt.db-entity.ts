import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'login_attempt' })
export class LoginAttemptDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'boolean' })
  result: boolean;

  @Column({ name: 'ip_address', type: 'varchar', length: 64 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text' })
  userAgent: string;

  @Column({
    name: 'failure_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  failureReason: string | null;

  @Column({ name: 'attempted_at', type: 'datetime' })
  attemptedAt: Date;
}
