import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class AppConfigService extends BaseConfigService {
  get APP_NAME(): string {
    return this.getString('APP_NAME');
  }

  get PORT(): number {
    return this.getNumber('PORT');
  }
}
