import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

import { UserEntity } from './user.typeorm.entity';

@Entity({ name: 'profile' })
export class ProfileEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: false })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: false })
  lastName!: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string;

  @Column({ name: 'language', type: 'varchar', length: 10, default: 'en' })
  language!: string;

  @OneToOne(
    () => UserEntity,
    (user) => user.profile,
  )
  user!: UserEntity;
}
