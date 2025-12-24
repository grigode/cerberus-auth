import { User } from '../user';
import { UserDevice } from '../user-device/user-device';
import {
  RefreshTokenCreatedAtVo,
  RefreshTokenExpiresAtVo,
  RefreshTokenIdVo,
  RefreshTokenRevokedAtVo,
  RefreshTokenTokenHashVo,
} from './value-objects';

export interface RefreshTokenI {
  id: RefreshTokenIdVo | null;
  tokenHash: RefreshTokenTokenHashVo;
  revokedAt: RefreshTokenRevokedAtVo | null;
  createdAt: RefreshTokenCreatedAtVo | null;
  expiresAt: RefreshTokenExpiresAtVo;
  user: User | null;
  userDevice: UserDevice | null;
}

export type RefreshTokenCreateT = Omit<
  RefreshTokenI,
  'id' | 'revokedAt' | 'createdAt' | 'expiresAt'
>;

export class RefreshToken implements RefreshTokenI {
  id: RefreshTokenIdVo | null;
  tokenHash: RefreshTokenTokenHashVo;
  revokedAt: RefreshTokenRevokedAtVo | null;
  createdAt: RefreshTokenCreatedAtVo | null;
  expiresAt: RefreshTokenExpiresAtVo;
  user: User | null;
  userDevice: UserDevice | null;

  constructor(attr: RefreshTokenI) {
    this.id = attr.id;
    this.tokenHash = attr.tokenHash;
    this.revokedAt = attr.revokedAt;
    this.createdAt = attr.createdAt;
    this.expiresAt = attr.expiresAt;
    this.user = attr.user;
    this.userDevice = attr.userDevice;
  }

  static create(attrs: RefreshTokenCreateT) {
    const now = new Date(Date.now());
    return new RefreshToken({
      ...attrs,
      id: null,
      revokedAt: null,
      createdAt: new RefreshTokenCreatedAtVo(now),
      expiresAt: RefreshTokenExpiresAtVo.generate(now),
    });
  }
}
