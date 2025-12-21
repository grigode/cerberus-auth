import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AppConfigService } from './app-config.service';

export const MAIN_DATABASE_SYMBOL = Symbol('MAIN_DATABASE_PROVIDER');

export const mainDatabaseProvider: Provider = {
  provide: MAIN_DATABASE_SYMBOL,
  inject: [AppConfigService],
  useFactory: async (appService: AppConfigService) => {
    const dataSource = new DataSource(appService.MAIN_DATABASE_SOURCE);

    return dataSource.initialize();
  },
};

export const databaseProviders: Provider[] = [mainDatabaseProvider];
