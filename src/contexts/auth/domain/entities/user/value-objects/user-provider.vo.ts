import { ValidationError } from 'src/contexts/shared/domain';

export const PROVIDERS = ['auth', 'google', 'github'];

export enum AuthProvider {
  AUTH = 'auth',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export class UserProviderVo {
  private constructor(readonly value: AuthProvider) {}

  static create(value: string): UserProviderVo {
    if (!Object.values(AuthProvider).includes(value as AuthProvider)) {
      throw new ValidationError(`Invalid auth provider: ${value}`);
    }

    return new UserProviderVo(value as AuthProvider);
  }

  static fromPersistence(value: string): UserProviderVo {
    return new UserProviderVo(value as AuthProvider);
  }
}
