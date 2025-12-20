import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.db-entity';

/**
 * Represents an authentication provider.
 *
 * Examples include:
 * - auth (username/password)
 * - google
 * - github
 *
 * This allows the system to support multiple authentication strategies
 * without coupling them directly to the User entity.
 */
@Entity({ name: 'provider' })
export class ProviderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  name: string;

  @OneToMany(() => UserEntity, (user) => user.profile)
  user: UserEntity[];
}
