import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.typeorm.entity';

@Entity({ name: 'role' })
export class RoleEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 20, nullable: false })
  name!: string;

  @OneToMany(
    () => UserEntity,
    (user) => user.role,
  )
  users!: UserEntity[];
}
