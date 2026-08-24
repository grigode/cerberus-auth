import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class AppConfigService extends BaseConfigService {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

  get APP_NAME(): string {
    return this.getString('APP_NAME');
  }

  get PORT(): number {
    return this.getNumber('PORT');
  }

  get IS_HTTPS(): boolean {
    return this.getBoolean('IS_HTTPS');
  }

  get FRONTEND_URL(): string {
    return this.getString('FRONTEND_URL');
  }

  get LOG_LEVEL(): string {
    return this.getString('LOG_LEVEL');
  }

  get LOG_DIR(): string {
    return this.getString('LOG_DIR');
  }

  get LOG_TO_FILE(): boolean {
    return this.getBoolean('LOG_TO_FILE');
  }
}
