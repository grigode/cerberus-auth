import { InternalServerError } from 'src/contexts/shared/domain/errors/internal-server-error';

import {
  ConfirmationToken,
  Profile,
  ProfileResponse,
  RefreshToken,
  Role,
  UserMfa,
} from '../index';
import {
  UserCreatedAtVo,
  UserEmailVo,
  UserIdVo,
  UserIsActiveVo,
  UserIsEmailVerifiedVo,
  UserLastLoginAtVo,
  UserMustChangePasswordVo,
  UserPasswordVo,
  UserProviderVo,
  UserUpdatedAtVo,
  UserUsernameVo,
} from './value-objects';

export interface UserI {
  id: UserIdVo | null;
  username: UserUsernameVo;
  email: UserEmailVo;
  password: UserPasswordVo | null;
  mustChangePassword: UserMustChangePasswordVo;
  provider: UserProviderVo;
  role: Role;
  isActive: UserIsActiveVo;
  isEmailVerified: UserIsEmailVerifiedVo;
  createdAt: UserCreatedAtVo | null;
  updatedAt: UserUpdatedAtVo | null;
  lastloginAt: UserLastLoginAtVo | null;
  profile: Profile;
  confirmationTokens: ConfirmationToken[] | null;
  refreshTokens: RefreshToken[] | null;
  userMfas: UserMfa[] | null;
}

export type UserCreateT = Omit<
  UserI,
  | 'id'
  | 'mustChangePassword'
  | 'isActive'
  | 'isEmailVerified'
  | 'createdAt'
  | 'updatedAt'
  | 'lastloginAt'
>;

export interface UserResponseI {
  id: number;
  username: string;
  email: string;
  mustChangePassword: boolean;
  role: any;
  profile: ProfileResponse;
}

export class User implements UserI {
  id: UserIdVo | null;
  username: UserUsernameVo;
  email: UserEmailVo;
  password: UserPasswordVo | null;
  mustChangePassword: UserMustChangePasswordVo;
  provider: UserProviderVo;
  role: Role;
  isActive: UserIsActiveVo;
  isEmailVerified: UserIsEmailVerifiedVo;
  createdAt: UserCreatedAtVo | null;
  updatedAt: UserUpdatedAtVo | null;
  lastloginAt: UserLastLoginAtVo | null;
  profile: Profile;
  confirmationTokens: ConfirmationToken[] | null;
  refreshTokens: RefreshToken[] | null;
  userMfas: UserMfa[] | null;

  constructor(attr: UserI) {
    this.id = attr.id;
    this.username = attr.username;
    this.email = attr.email;
    this.password = attr.password;
    this.mustChangePassword = attr.mustChangePassword;
    this.provider = attr.provider;
    this.role = attr.role;
    this.isActive = attr.isActive;
    this.isEmailVerified = attr.isEmailVerified;
    this.createdAt = attr.createdAt;
    this.updatedAt = attr.updatedAt;
    this.lastloginAt = attr.lastloginAt;
    this.profile = attr.profile;
    this.confirmationTokens = attr.confirmationTokens;
    this.refreshTokens = attr.refreshTokens;
    this.userMfas = attr.userMfas;
  }

  static create(attrs: UserCreateT) {
    return new User({
      ...attrs,
      id: null,
      mustChangePassword: UserMustChangePasswordVo.default(),
      isActive: UserIsActiveVo.default(),
      isEmailVerified: UserIsEmailVerifiedVo.default(),
      createdAt: null,
      updatedAt: null,
      lastloginAt: null,
    });
  }

  toResponse(): UserResponseI {
    if (!this.id)
      throw new InternalServerError("You can't generate a response without id");

    // You can comment/uncomment some attributes (Remenber update `UserResponse`)
    return {
      id: this.id.value,
      username: this.username.value,
      email: this.email.value,
      mustChangePassword: this.mustChangePassword.value,
      role: this.role.toResponse(),
      // isActive: this.isActive.value,
      // createdAt: this.createdAt?.value,
      // updatedAt: this.updatedAt?.value,
      // lastloginAt: this.lastloginAt?.value,
      profile: this.profile.toResponse(),
    };
  }
}
