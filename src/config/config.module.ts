import { Module } from '@nestjs/common';
import { ConfigModule as NestJsConfigModule } from '@nestjs/config';
import Joi from 'joi';

import { appConfigSchema } from './app';
import { AppConfigService } from './app/app-config.service';
import { databaseConfigSchema, DatabaseConfigService } from './database';
import { securityConfigSchema, SecurityConfigService } from './security';

@Module({
  imports: [
    NestJsConfigModule.forRoot({
      cache: true,
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        ...appConfigSchema,
        ...databaseConfigSchema,
        ...securityConfigSchema,
      }),
    }),
  ],
  providers: [AppConfigService, DatabaseConfigService, SecurityConfigService],
  exports: [AppConfigService, DatabaseConfigService, SecurityConfigService],
})
export class ConfigModule {}
