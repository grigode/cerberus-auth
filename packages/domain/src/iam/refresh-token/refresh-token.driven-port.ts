import type { RefreshToken } from './refresh-token.entity';
import type { UuidVo } from '../../common';

export interface RefreshTokenDrivenPort {
  findById: (id: UuidVo) => Promise<RefreshToken | null>;
  findByToken: (token: string) => Promise<RefreshToken | null>;
  findAllActiveByUserId: (userId: UuidVo) => Promise<RefreshToken[]>;

  create: (refreshToken: RefreshToken) => Promise<RefreshToken>;

  update: (refreshToken: RefreshToken) => Promise<void>;
  revokeById: (id: UuidVo) => Promise<void>;
  revokeAllByUserId: (userId: UuidVo) => Promise<void>;
}
