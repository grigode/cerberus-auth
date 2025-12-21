import { AppConfigService } from 'src/config/app-config.service';
import { HashPasswordAdapter } from 'src/contexts/identity/infrastructure/adapters/hash-password.adapter';
import {
  PermissionEntity,
  ProfileEntity,
  ProviderEntity,
  RoleEntity,
  UserEntity,
} from 'src/contexts/shared/database/infrastructure';
import { DataSource } from 'typeorm';

export const seedDatabase = async (
  dataSource: DataSource,
  config: AppConfigService,
) => {
  const permissionRepo = dataSource.getRepository(PermissionEntity);
  const roleRepo = dataSource.getRepository(RoleEntity);
  const userRepo = dataSource.getRepository(UserEntity);
  const providerRepo = dataSource.getRepository(ProviderEntity);

  // Permissions

  const permissions = [
    // User
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    // Admin
    'admin:create',
    'admin:read',
    'admin:update',
    'admin:delete',
    // Role
    'role:create',
    'role:assign',
    // Audit
    'audit:read',
  ];

  const permissionEntities: PermissionEntity[] = [];

  for (const name of permissions) {
    let perm = await permissionRepo.findOne({ where: { name } });

    if (!perm) {
      perm = permissionRepo.create({ name });
      await permissionRepo.save(perm);
    }

    permissionEntities.push(perm);
  }

  const findPermission = (name: string) =>
    permissionEntities.find((p) => p.name === name);

  // Roles

  const rolesData = [
    {
      name: 'admin',
      permissions: permissionEntities,
    },
    {
      name: 'user',
      permissions: [
        findPermission('user:create')!,
        findPermission('user:read')!,
        findPermission('user:update')!,
        findPermission('user:delete')!,
      ],
    },
    {
      name: 'auditor',
      permissions: [findPermission('audit:read')!],
    },
  ];

  const roleEntities: RoleEntity[] = [];

  for (const roleData of rolesData) {
    let role = await roleRepo.findOne({ where: { name: roleData.name } });

    if (!role) {
      role = roleRepo.create(roleData);
      await roleRepo.save(role);
    }

    roleEntities.push(role);
  }

  const findRole = (name: string) => roleEntities.find((r) => r.name === name);

  // Providers

  const providers = ['auth', 'google', 'github'];

  const providerEntities: ProviderEntity[] = [];

  for (const provider of providers) {
    let pro = await providerRepo.findOne({ where: { name: provider } });

    if (!pro) {
      pro = providerRepo.create({ name: provider });
      await providerRepo.save(pro);
    }

    providerEntities.push(pro);
  }

  const findProvider = (name: string) =>
    providerEntities.find((p) => p.name === name);

  // SuperAdmin

  const credentials = config.SUPERADMIN_CREDENTIALS;

  const superAdmin = await userRepo.findOne({
    where: { email: credentials.email },
    relations: ['role'],
  });

  if (!superAdmin) {
    const profile = new ProfileEntity();
    profile.firstName = credentials.firstName;
    profile.lastName = credentials.lastName;
    await dataSource.manager.save(profile);

    await userRepo.insert({
      username: credentials.username,
      email: credentials.email,
      password: await HashPasswordAdapter.hash(credentials.password),
      mustChangePassword: true,
      isEmailVerified: true,
      provider: findProvider('auth')!,
      role: findRole('admin')!,
      profile,
    });
  }
};
