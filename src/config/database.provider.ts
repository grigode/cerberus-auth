import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AppConfigService } from './app-config.service';

export const DATA_SOURCE_SYMBOL = Symbol('DATA_SOURCE');

export const databaseProviders: Provider[] = [
  {
    provide: DATA_SOURCE_SYMBOL,
    inject: [AppConfigService],
    useFactory: async (appService: AppConfigService) => {
      const dataSource = new DataSource(appService.MAIN_DATABASE_SOURCE);

      return dataSource.initialize();
    },
  },
];
