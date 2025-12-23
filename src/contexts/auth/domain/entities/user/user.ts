import {
  ConfirmationToken,
  Profile,
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
  UserLastLoginAt,
  UserMustChangePasswordVo,
  UserPasswordVo,
  UserProviderVo,
  UserUpdatedAtVo,
  UserUsernameVo,
} from './value-objects';

export class User {
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
  lastloginAt: UserLastLoginAt | null;
  profile: Profile;
  confirmationTokens: ConfirmationToken[] | null;
  refreshTokens: RefreshToken[] | null;
  userMfas: UserMfa[] | null;
}
