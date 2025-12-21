import { Column, Entity, OneToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.db-entity';

/**
 * Represents user profile data that is not security-sensitive.
 *
 * This entity is intentionally separated from the User entity
 * to keep authentication and identity concerns isolated from
 * presentation and personalization data.
 *
 * This is the entity that SHOULD be extended when adding
 * user-specific information such as language, locale,
 * preferences, avatars, or other profile-related attributes.
 */
@Entity({ name: 'profile' })
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'firt_name', type: 'varchar', length: 32 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 32 })
  lastName: string;

  @Column({
    name: 'profile_image',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  profileImage: string | null;

  @OneToOne(() => UserEntity, (user) => user.profile)
  user: UserEntity;
}
