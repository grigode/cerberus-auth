import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigService } from './app-config.service';
import { databaseProviders } from './database.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [AppConfigService, ...databaseProviders],
  exports: [AppConfigService, ...databaseProviders],
})
export class AppConfigModule {}
