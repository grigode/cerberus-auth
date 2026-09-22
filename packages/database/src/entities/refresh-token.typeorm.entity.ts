import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserEntity } from './user.typeorm.entity';

@Entity({ name: 'refresh_token' })
export class RefreshTokenEntity {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.refreshTokens,
  )
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({
    name: 'token',
    type: 'char',
    unique: true,
    length: 64,
    nullable: false,
  })
  token!: string;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: false })
  expiresAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;
}
