import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RefreshTokenEntity } from './refresh-token.db-entity';

/**
 * Represents a physical or logical device used by a user to authenticate.
 *
 * Devices are used to:
 * - associate refresh tokens with a specific client
 * - implement device-based trust mechanisms
 * - improve session security and visibility
 *
 * A device marked as `trusted` may be allowed to bypass certain security checks
 * depending on the authentication policy.
 *
 * Devices are soft-deleted to preserve historical session data.
 */
@Entity({ name: 'user_device' })
export class UserDeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'device_info', type: 'text' })
  deviceInfo: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 64 })
  ipAddress: string;

  @Column({ type: 'boolean', default: false })
  trusted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'last_used_at', type: 'datetime', nullable: true })
  lastUsedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;

  @OneToMany(
    () => RefreshTokenEntity,
    (refreshToken) => refreshToken.userDevice,
  )
  refreshTokens: RefreshTokenEntity[];
}
