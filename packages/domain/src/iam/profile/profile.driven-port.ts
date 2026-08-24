import type { UuidVo } from '../../common';
import type { Profile } from './profile.entity';

export interface ProfileDrivenPort {
  findByUserId: (userId: UuidVo) => Promise<Profile | null>;

  create: (profile: Profile) => Promise<Profile>;

  update: (profile: Profile) => Promise<Profile>;
}
