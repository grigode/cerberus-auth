import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class DatabaseConfigService extends BaseConfigService {
  get MAIN_DATABASE_SOURCE() {
    return {
      host: this.getString('MAIN_DATABASE_HOST'),
      port: this.getNumber('MAIN_DATABASE_PORT'),
      username: this.getString('MAIN_DATABASE_USERNAME'),
      password: this.getString('MAIN_DATABASE_PASSWORD'),
      database: this.getString('MAIN_DATABASE_NAME'),
      synchronize: this.getBoolean('MAIN_DATABASE_SYNCHRONIZE'),
      timezone: this.getString('MAIN_DATABASE_TIMEZONE'),
    };
  }
}
