import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.db-entity';

/**
 * Represents a single-use confirmation token associated with a user.
 *
 * Tokens are generated for actions such as email verification or account confirmation.
 * The token value MUST be stored as a hash, never in plain text.
 *
 * A token is considered:
 * - valid if `used_at` is NULL and `expires_at` is in the future
 * - consumed once `used_at` is set
 *
 * Tokens are not deleted after use to allow auditing and debugging.
 */
@Entity({ name: 'confirmation_token' })
export class ConfirmationTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token_hash', type: 'char', length: 64 })
  tokenHash: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.confirmationTokens)
  user: UserEntity;
}
