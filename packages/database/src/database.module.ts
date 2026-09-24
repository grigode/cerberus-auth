import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@core/config';

import { databaseProviders } from './database.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
