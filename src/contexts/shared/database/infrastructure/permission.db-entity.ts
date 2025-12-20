import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { RoleEntity } from './role.db-entity';

/**
 * Represents a fine-grained permission that can be assigned to roles.
 *
 * Permissions are intended to be stable, unique identifiers
 * and should not encode business logic directly.
 */
@Entity({ name: 'permission' })
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  name: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
