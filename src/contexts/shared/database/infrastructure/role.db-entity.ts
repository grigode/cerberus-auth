import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PermissionEntity } from './permission.db-entity';
import { UserEntity } from './user.db-entity';

/**
 * Represents a role used for authorization.
 *
 * Roles are collections of permissions and are intended to be stable identifiers
 * (e.g. "admin", "user", "moderator").
 *
 * Users are assigned exactly one role in this model.
 */
@Entity({ name: 'role' })
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  name: string;

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable()
  permissions: PermissionEntity[];
}
