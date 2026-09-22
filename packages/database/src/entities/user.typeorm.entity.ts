import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { ConfirmationTokenEntity } from './confirmation-token.typeorm.entity';
import { ProfileEntity } from './profile.typeorm.entity';
import { ProviderEntity } from './provider.typeorm.entity';
import { RefreshTokenEntity } from './refresh-token.typeorm.entity';
import { RoleEntity } from './role.typeorm.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({
    name: 'email',
    unique: true,
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  email!: string;

  @Column({ name: 'password', type: 'varchar', length: 100, nullable: true })
  password?: string;

  @ManyToMany(() => ProviderEntity)
  @JoinTable()
  providers!: ProviderEntity[];

  @ManyToOne(
    () => RoleEntity,
    (role) => role.users,
  )
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isActive!: boolean;

  @Column({
    name: 'is_email_verified',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isEmailVerified!: boolean;

  @Column({
    name: 'is_mfa_enabled',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isMfaEnabled!: boolean;

  @Column({
    name: 'mfa_secret',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mfaSecret?: string;

  @Column({
    name: 'mfa_backup_codes',
    type: 'simple-array',
    nullable: true,
  })
  mfaBackupCodes?: string[];

  @Column({
    name: 'failed_login_attempts',
    type: 'int',
    default: 0,
    nullable: false,
  })
  failedLoginAttempts!: number;

  @Column({ name: 'lockout_until', type: 'timestamptz', nullable: true })
  lockoutUntil?: Date;

  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt?: Date;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @OneToOne(() => ProfileEntity)
  @JoinColumn()
  profile!: ProfileEntity;

  @OneToMany(
    () => ConfirmationTokenEntity,
    (confirmationToken) => confirmationToken.user,
  )
  confirmationTokens!: ConfirmationTokenEntity[];

  @OneToMany(
    () => RefreshTokenEntity,
    (refreshTokens) => refreshTokens.user,
  )
  refreshTokens!: RefreshTokenEntity[];
}
