import { Module } from '@nestjs/common';

import { AppConfig } from './config/config.module';

@Module({
  imports: [AppConfig],
})
export class AppModule {}
