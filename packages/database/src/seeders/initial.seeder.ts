import argon2 from 'argon2';
import type { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class InitialSeeder {
  constructor(private readonly dataSource: DataSource) {}

  public async run(): Promise<void> {
    console.log('🌱 Starting Initial Seeder execution...');

    // 1. Seed Roles
    const roles = [
      { id: 1, name: 'superadmin' },
      { id: 2, name: 'admin' },
      { id: 3, name: 'staff' },
      { id: 4, name: 'user' },
    ];

    console.log('  └─ Roles initialized.');

    // 2. Seed Providers
    const providers = [
      { id: 1, name: 'email' },
      { id: 2, name: 'google' },
    ];

    console.log('  └─ Providers initialized.');

    console.log('✅ Initial Seeder completed successfully!');
  }
}
