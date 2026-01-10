import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class AppConfigService extends BaseConfigService {
  constructor(configService: ConfigService) {
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

  get HTTPS_KEY_PATH(): string | undefined {
    return this.configService.get<string>('HTTPS_KEY_PATH');
  }

  get HTTPS_CERT_PATH(): string | undefined {
    return this.configService.get<string>('HTTPS_CERT_PATH');
  }
}
