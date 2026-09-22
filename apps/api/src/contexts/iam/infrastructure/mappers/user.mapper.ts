import { ProviderVo, RoleVo, User } from '@core/domain';
import { InfrastructureException, type Mapper } from '@core/shared-server';

import { ProviderEntity, RoleEntity, UserEntity } from '@core/database';

const roleMapInfrastructure: Record<string, number> = {
  superadmin: 1,
  admin: 2,
  staff: 3,
  user: 4,
} as const;

const roleMapDomain: Record<string, RoleVo> = {
  superadmin: RoleVo.SUPERADMIN,
  admin: RoleVo.ADMIN,
  staff: RoleVo.STAFF,
  user: RoleVo.USER,
};

const providerMapInfrastructure: Record<string, number> = {
  email: 1,
  google: 2,
} as const;

const providerMapDomain: Record<string, ProviderVo> = {
  email: ProviderVo.EMAIL,
  google: ProviderVo.GOOGLE,
};

export class UserMapper implements Mapper<User, UserEntity> {
  private mapRoleVoToEntity(role: string) {
    const key = role.toLowerCase();
    const roleId = roleMapInfrastructure[key];
    if (!roleId)
      throw new InfrastructureException(
        `Invalid domain role in database: ${role}`,
      );
    const roleEntity = new RoleEntity();
    roleEntity.id = roleId;
    roleEntity.name = key;
    return roleEntity;
  }

  private mapProviderVoToEntity(provider: string) {
    const key = provider.toLowerCase();
    const providerId = providerMapInfrastructure[key];

    if (!providerId)
      throw new InfrastructureException(
        `Invalid domain role in database: ${provider}`,
      );

    const providerEntity = new ProviderEntity();
    providerEntity.id = providerId;
    providerEntity.name = key;
    return providerEntity;
  }

  domainToInfrastructure(entity: User): UserEntity {
    const data = entity.data;

    const entityMapped = new UserEntity();
    entityMapped.id = data.id;
    entityMapped.email = data.email;
    entityMapped.password = data.hashedPassword;
    entityMapped.providers = Array(...data.providers).map((p) =>
      this.mapProviderVoToEntity(p.toString()),
    );
    entityMapped.role = this.mapRoleVoToEntity(data.role.toString());
    entityMapped.isActive = data.isActive;
    entityMapped.isEmailVerified = data.isEmailVerified;
    entityMapped.isMfaEnabled = data.isMfaEnabled;
    entityMapped.mfaSecret = data.mfaSecret;
    entityMapped.mfaBackupCodes = data.mfaBackupCodes;
    entityMapped.failedLoginAttempts = data.failedLoginAttempts;
    entityMapped.lockoutUntil = data.lockoutUntil;
    entityMapped.createdAt = data.createdAt;
    entityMapped.updatedAt = data.updatedAt;
    entityMapped.lastLoginAt = data.lastLoginAt;

    return entityMapped;
  }

  private mapRoleToVo(roleName: string): RoleVo {
    const role = roleMapDomain[roleName];
    if (!role)
      throw new InfrastructureException(
        `Invalid domain role in database: ${roleName}`,
      );

    return role;
  }

  private mapProviderToVo(providerName: string): ProviderVo {
    const provider = providerMapDomain[providerName];
    if (!provider)
      throw new InfrastructureException(
        `Invalid domain provider in database: ${providerName}`,
      );

    return provider;
  }

  infrastructureToDomain(entity: UserEntity): User {
    try {
      if (!entity.email)
        throw new InfrastructureException(
          'The email cannot be empty in the infrastructure entity',
        );

      const role = this.mapRoleToVo(entity.role.name);

      const providers = entity.providers.map((p) =>
        this.mapProviderToVo(p.name),
      );

      return new User({
        id: entity.id,
        email: entity.email,
        hashedPassword: entity.password,
        providers: new Set(providers),
        role: role,
        isActive: entity.isActive ?? false,
        isEmailVerified: entity.isEmailVerified ?? false,
        isMfaEnabled: entity.isMfaEnabled ?? false,
        mfaSecret: entity.mfaSecret,
        mfaBackupCodes: entity.mfaBackupCodes ?? [],
        failedLoginAttempts: entity.failedLoginAttempts ?? 0,
        lockoutUntil: entity.lockoutUntil
          ? entity.lockoutUntil instanceof Date
            ? entity.lockoutUntil
            : new Date(entity.lockoutUntil)
          : undefined,
        createdAt:
          entity.createdAt instanceof Date
            ? entity.createdAt
            : new Date(entity.createdAt),
        updatedAt: entity.updatedAt
          ? entity.updatedAt instanceof Date
            ? entity.updatedAt
            : new Date(entity.updatedAt)
          : undefined,
        lastLoginAt: entity.lastLoginAt
          ? entity.lastLoginAt instanceof Date
            ? entity.lastLoginAt
            : new Date(entity.lastLoginAt)
          : undefined,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new InfrastructureException(
        `Error mapping user entity from database: ${msg}`,
      );
    }
  }
}
