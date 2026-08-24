import 'reflect-metadata';
import AppDataSource from './data-source';
import { InitialSeeder } from './initial.seeder';

async function run() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connected successfully.');

    const seeder = new InitialSeeder(AppDataSource);
    await seeder.run();

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder execution failed:', error);
    process.exit(1);
  }
}

void run();
