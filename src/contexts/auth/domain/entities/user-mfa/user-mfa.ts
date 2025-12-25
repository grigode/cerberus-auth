import { InternalServerError } from 'src/contexts/shared/domain/errors/internal-server-error';

import {
  UserMfaAuthTagVo,
  UserMfaConfirmedAtVo,
  UserMfaDeletedAtVo,
  UserMfaEnabledAtVo,
  UserMfaIvVo,
  UserMfaLastusedAtVo,
  UserMfaSecretCiphertextVo,
} from './value-objects';
import { User } from '../user/user';
import { UserIdVo } from '../user/value-objects';

export interface UserMfaI {
  id: UserIdVo | null;
  secretCiphertext: UserMfaSecretCiphertextVo;
  iv: UserMfaIvVo;
  authTag: UserMfaAuthTagVo;
  enabledAt: UserMfaEnabledAtVo;
  confirmedAt: UserMfaConfirmedAtVo | null;
  lastUsedAt: UserMfaLastusedAtVo | null;
  deletedAt: UserMfaDeletedAtVo | null;
  user: User;
}

export type UserMfaCreateT = Omit<
  UserMfaI,
  'id' | 'createdAt' | 'enabledAt' | 'confirmedAt' | 'lastUsedAt' | 'deletedAt'
>;

export interface UserMfaResponse {
  id: number;
  enabledAt: Date;
  confirmedAt: Date | undefined;
  lastUsedAt: Date | undefined;
  deletedAt: Date | undefined;
}

export class UserMfa implements UserMfaI {
  id: UserIdVo | null;
  secretCiphertext: UserMfaSecretCiphertextVo;
  iv: UserMfaIvVo;
  authTag: UserMfaAuthTagVo;
  enabledAt: UserMfaEnabledAtVo;
  confirmedAt: UserMfaConfirmedAtVo | null;
  lastUsedAt: UserMfaLastusedAtVo | null;
  deletedAt: UserMfaDeletedAtVo | null;
  user: User;

  constructor(attr: UserMfaI) {
    this.id = attr.id;
    this.secretCiphertext = attr.secretCiphertext;
    this.iv = attr.iv;
    this.authTag = attr.authTag;
    this.enabledAt = attr.enabledAt;
    this.confirmedAt = attr.confirmedAt;
    this.lastUsedAt = attr.lastUsedAt;
    this.deletedAt = attr.deletedAt;
    this.user = attr.user;
  }

  static create(attrs: UserMfaCreateT) {
    return new UserMfa({
      ...attrs,
      id: null,
      enabledAt: UserMfaEnabledAtVo.now(),
      confirmedAt: null,
      lastUsedAt: null,
      deletedAt: null,
    });
  }

  toResponse(): UserMfaResponse {
    if (!this.id)
      throw new InternalServerError("You can't generate a response without id");

    return {
      id: this.id.value,
      enabledAt: this.enabledAt.value,
      confirmedAt: this.confirmedAt?.value,
      lastUsedAt: this.lastUsedAt?.value,
      deletedAt: this.deletedAt?.value,
    };
  }
}
