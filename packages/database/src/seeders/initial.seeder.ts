import argon2 from 'argon2';
import type { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  ProfileEntity,
  ProviderEntity,
  RoleEntity,
  UserEntity,
} from '../entities';

export class InitialSeeder {
  constructor(private readonly dataSource: DataSource) {}

  public async run(): Promise<void> {
    console.log('🌱 Starting Initial Seeder execution...');

    const roleRepository = this.dataSource.getRepository(RoleEntity);
    const providerRepository = this.dataSource.getRepository(ProviderEntity);
    const userRepository = this.dataSource.getRepository(UserEntity);
    const profileRepository = this.dataSource.getRepository(ProfileEntity);

    // 1. Seed Roles
    const roles = [
      { id: 1, name: 'superadmin' },
      { id: 2, name: 'admin' },
      { id: 3, name: 'staff' },
      { id: 4, name: 'user' },
    ];

    for (const r of roles) {
      const exists = await roleRepository.findOneBy({ id: r.id });
      if (!exists) {
        await roleRepository.save(r);
        console.log(`  └─ Created Role: ${r.name} (id: ${r.id})`);
      }
    }

    // 2. Seed Providers
    const providers = [
      { id: 1, name: 'email' },
      { id: 2, name: 'google' },
    ];

    for (const p of providers) {
      const exists = await providerRepository.findOneBy({ id: p.id });
      if (!exists) {
        await providerRepository.save(p);
        console.log(`  └─ Created Provider: ${p.name} (id: ${p.id})`);
      }
    }

    // 3. Seed Default SuperAdmin User
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@cerberus.com';
    const adminPassword =
      process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPass123!#';

    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
      relations: { role: true, profile: true },
    });

    if (!existingAdmin) {
      const superadminRole = await roleRepository.findOneBy({ id: 1 });
      const emailProvider = await providerRepository.findOneBy({ id: 1 });

      if (!superadminRole || !emailProvider) {
        throw new Error(
          'Superadmin role or Email provider not found for seeding',
        );
      }

      const userId = uuidv4();
      const hashedPassword = await argon2.hash(adminPassword);

      // Create Profile
      const profile = profileRepository.create({
        userId: userId,
        firstName: 'System',
        lastName: 'Superadmin',
        language: 'en',
      });
      await profileRepository.save(profile);

      // Create User
      const user = userRepository.create({
        id: userId,
        email: adminEmail,
        password: hashedPassword,
        role: superadminRole,
        providers: [emailProvider],
        isActive: true,
        isEmailVerified: true,
        isMfaEnabled: false,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        profile: profile,
      });

      await userRepository.save(user);
      console.log(`  └─ Created Default SuperAdmin User: ${adminEmail}`);
    } else {
      console.log(`  └─ SuperAdmin User already exists: ${adminEmail}`);
    }

    console.log('✅ Initial Seeder completed successfully!');
  }
}
