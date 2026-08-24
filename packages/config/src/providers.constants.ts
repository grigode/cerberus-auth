import { AppConfigService } from './app';
import { DatabaseConfigService } from './database';
import { HttpConfigService } from './http';
import { MailConfigService } from './mail';
import { RedisConfigService } from './redis';
import { SecurityConfigService } from './security';
import { StorageConfigService } from './storage';

export const providers = [
  AppConfigService,
  DatabaseConfigService,
  HttpConfigService,
  MailConfigService,
  RedisConfigService,
  SecurityConfigService,
  StorageConfigService,
];
