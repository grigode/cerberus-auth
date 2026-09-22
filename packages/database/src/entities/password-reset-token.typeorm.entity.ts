import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserEntity } from './user.typeorm.entity';

@Entity({ name: 'password_reset_token' })
export class PasswordResetTokenEntity {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({
    name: 'token',
    type: 'char',
    unique: true,
    length: 32,
    nullable: false,
  })
  token!: string;

  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: false })
  expiresAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt?: Date;
}
