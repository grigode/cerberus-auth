import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/app-config.module';
import { LoggerModule } from './contexts/shared/logger/infrastructure';

@Module({
  imports: [AppConfigModule, LoggerModule],
})
export class AppModule {}
