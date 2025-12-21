import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ConfirmationTokenEntity } from './confirmation-token.db-entity';
import { ProfileEntity } from './profile.db-entity';
import { ProviderEntity } from './provider.db-entity';
import { RefreshTokenEntity } from './refresh-token.db-entity';
import { RoleEntity } from './role.db-entity';
import { UserMfaEntity } from './user-mfa.db-entity';

/**
 * Represents an application user.
 *
 * This entity models the user's identity and authorization state,
 * but intentionally separates authentication events from user mutations.
 *
 * Design decisions:
 * - `updated_at` reflects structural or functional changes to the user
 *   (email, password, role, flags, etc.).
 * - Authentication events (login) MUST NOT update `updated_at`.
 * - Login activity is tracked separately via `last_login_at`.
 *
 * This separation avoids noisy updates, preserves auditability,
 * and keeps domain state changes explicit.
 */
@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'must_change_password', type: 'boolean', default: false })
  mustChangePassword: boolean;

  @ManyToOne(() => ProviderEntity, (provider) => provider.users)
  provider: ProviderEntity;

  @ManyToOne(() => RoleEntity, (provider) => provider.users)
  role: RoleEntity;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  /**
   * Updated only on actual user data changes.
   * Authentication events (login) must NOT update this field.
   */
  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  @JoinColumn()
  profile: ProfileEntity;

  @OneToMany(
    () => ConfirmationTokenEntity,
    (confirmationToken) => confirmationToken.user,
  )
  confirmationTokens: ConfirmationTokenEntity[];

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => UserMfaEntity, (userMfa) => userMfa.user)
  userMfas: UserMfaEntity[];
}
