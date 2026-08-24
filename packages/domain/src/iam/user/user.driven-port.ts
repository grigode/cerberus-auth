import type { UuidVo } from '../../common';
import type { User } from './user.entity';

export interface UserDrivenPort {
  findById: (id: UuidVo) => Promise<User | null>;
  findByEmail: (email: string) => Promise<User | null>;
  verifyIfExistsByEmail: (email: string) => Promise<boolean>;

  create: (user: User) => Promise<User>;

  update: (user: User) => Promise<void>;
}
