import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { UserEntity } from './user.typeorm.entity';

@Entity({ name: 'confirmation_tokens' })
export class ConfirmationTokenEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.confirmationTokens,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'token', type: 'varchar', nullable: false })
  token!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
  })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: false })
  expiresAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt?: Date;
}
