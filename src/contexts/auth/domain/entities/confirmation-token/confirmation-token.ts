import { User } from '../user';
import {
  ConfirmationTokenIdVo,
  ConfirmationTokenTokenHashVo,
  ConfirmationTokenCreatedAtVo,
  ConfirmationTokenExpiresAtVo,
  ConfirmationTokenUsedAtVo,
} from './value-objects';

export interface ConfirmationTokenI {
  id: ConfirmationTokenIdVo | null;
  tokenHash: ConfirmationTokenTokenHashVo;
  createdAt: ConfirmationTokenCreatedAtVo | null;
  expiresAt: ConfirmationTokenExpiresAtVo;
  usedAt: ConfirmationTokenUsedAtVo | null;
  user: User | null;
}

export type ConfirmationTokenCreateT = Omit<
  ConfirmationToken,
  'id' | 'createdAt' | 'expiresAt' | 'usedAt'
>;

export class ConfirmationToken implements ConfirmationTokenI {
  id: ConfirmationTokenIdVo | null;
  tokenHash: ConfirmationTokenTokenHashVo;
  createdAt: ConfirmationTokenCreatedAtVo | null;
  expiresAt: ConfirmationTokenExpiresAtVo;
  usedAt: ConfirmationTokenUsedAtVo | null;
  user: User | null;

  constructor(attr: ConfirmationTokenI) {
    this.id = attr.id;
    this.tokenHash = attr.tokenHash;
    this.createdAt = attr.createdAt;
    this.expiresAt = attr.expiresAt;
    this.usedAt = attr.usedAt;
    this.user = attr.user;
  }

  static create(attrs: ConfirmationTokenCreateT) {
    const now = new Date(Date.now());
    return new ConfirmationToken({
      ...attrs,
      id: null,
      createdAt: new ConfirmationTokenCreatedAtVo(now),
      expiresAt: ConfirmationTokenExpiresAtVo.generate(now),
      usedAt: null,
    });
  }
}
