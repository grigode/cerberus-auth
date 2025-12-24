import { InternalServerError } from 'src/contexts/shared/domain/errors/internal-server-error';
import { RefreshToken } from '../refresh-token';
import {
  UserDeviceCreatedAtVo,
  UserDeviceDeletedAtVo,
  UserDeviceDeviceInfoVo,
  UserDeviceIdVo,
  UserDeviceIpAddressVo,
  UserDeviceLastUsedAtVo,
  UserDeviceTrustedVo,
} from './value-objects';

export interface UserDeviceI {
  id: UserDeviceIdVo | null;
  deviceInfo: UserDeviceDeviceInfoVo;
  ipAddress: UserDeviceIpAddressVo;
  trusted: UserDeviceTrustedVo;
  createdAt: UserDeviceCreatedAtVo;
  lastUsedAt: UserDeviceLastUsedAtVo | null;
  deletedAt: UserDeviceDeletedAtVo | null;
  refreshTokens: RefreshToken[] | null;
}

export type UserDeviceCreateT = Omit<
  UserDeviceI,
  'id' | 'createdAt' | 'lastUsedAt' | 'deletedAt'
>;

export interface UserDeviceResponse {
  id: number;
  deviceInfo: string;
  trusted: boolean;
  createdAt: Date;
  lastUsedAt: Date | undefined;
}

export class UserDevice implements UserDeviceI {
  id: UserDeviceIdVo | null;
  deviceInfo: UserDeviceDeviceInfoVo;
  ipAddress: UserDeviceIpAddressVo;
  trusted: UserDeviceTrustedVo;
  createdAt: UserDeviceCreatedAtVo;
  lastUsedAt: UserDeviceLastUsedAtVo | null;
  deletedAt: UserDeviceDeletedAtVo | null;
  refreshTokens: RefreshToken[] | null;

  constructor(attr: UserDeviceI) {
    this.id = attr.id;
    this.deviceInfo = attr.deviceInfo;
    this.ipAddress = attr.ipAddress;
    this.trusted = attr.trusted;
    this.createdAt = attr.createdAt;
    this.lastUsedAt = attr.lastUsedAt;
    this.deletedAt = attr.deletedAt;
    this.refreshTokens = attr.refreshTokens;
  }

  static create(attrs: UserDeviceCreateT) {
    return new UserDevice({
      ...attrs,
      id: null,
      createdAt: UserDeviceCreatedAtVo.now(),
      lastUsedAt: null,
      deletedAt: null,
    });
  }

  toResponse(): UserDeviceResponse {
    if (!this.id)
      throw new InternalServerError("You can't generate a response without id");

    return {
      id: this.id.value,
      deviceInfo: this.deviceInfo.value,
      trusted: this.trusted.value,
      createdAt: this.createdAt.value,
      lastUsedAt: this.lastUsedAt?.value,
    };
  }
}
