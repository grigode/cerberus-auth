import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.db-entity';

/**
 * Represents a multi-factor authentication (MFA) method configured by a user.
 *
 * This entity is designed to support TOTP-based MFA and can be extended
 * for other methods (e.g. WebAuthn, SMS, email).
 *
 * The MFA secret MUST be stored encrypted at rest.
 * Activation is a two-step process:
 * - creation (`created_at`)
 * - confirmation (`confirmed_at`)
 *
 * Once enabled, usage is tracked via `last_used_at`.
 * MFA methods are soft-deleted to allow recovery and auditing.
 */
@Entity({ name: 'user_mfa' })
export class UserMfaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'secret_ciphertext', type: 'varbinary', length: 255 })
  secretCiphertext: Buffer;

  @Column({ type: 'varbinary', length: 12 })
  iv: Buffer;

  @Column({ name: 'auth_tag', type: 'varbinary', length: 16 })
  authTag: Buffer;

  @Column({ name: 'enabled_at', type: 'datetime', nullable: true })
  enabledAt: Date | null;

  @Column({ name: 'confirmed_at', type: 'datetime', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'last_used_at', type: 'datetime', nullable: true })
  lastUsedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.userMfas)
  user: UserEntity;
}
