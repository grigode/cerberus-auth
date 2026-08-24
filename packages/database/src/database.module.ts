import { Module } from '@nestjs/common';
import { ConfigModule } from '@core/config';

import { databaseProviders } from './database.provider';

@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
