import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from 'src/config/app-config.module';
import { AppConfigService } from 'src/config/app-config.service';
import { MAIN_DATABASE_SYMBOL } from 'src/config/database.provider';
import { DataSource } from 'typeorm';

import { seedDatabase } from './seed/index';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppConfigModule);

  const config = app.get(AppConfigService);
  const dataSource: DataSource = await app.get(MAIN_DATABASE_SYMBOL);

  await seedDatabase(dataSource, config);

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
