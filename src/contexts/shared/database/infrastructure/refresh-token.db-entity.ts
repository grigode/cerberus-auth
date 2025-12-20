import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserDeviceEntity } from './user-device.db-entity';
import { UserEntity } from './user.db-entity';

/**
 * Represents a refresh token used to issue new access tokens.
 *
 * Refresh tokens are long-lived, single-use credentials and MUST be stored as hashes.
 * Revocation is handled explicitly (preferably via a timestamp, not a boolean).
 *
 * Each refresh token may optionally be bound to a specific user device.
 * Tokens are not physically deleted to allow session tracking and revocation audits.
 */
@Entity({ name: 'refresh_token' })
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token_hash', type: 'char', length: 64 })
  tokenHash: string;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens)
  user: UserEntity;

  @ManyToOne(() => UserDeviceEntity, (userDevice) => userDevice.refreshTokens)
  userDevice: UserDeviceEntity;
}
