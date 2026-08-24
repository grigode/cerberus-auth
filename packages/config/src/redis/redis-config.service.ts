import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class RedisConfigService extends BaseConfigService {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

  get host(): string {
    return this.getString('REDIS_HOST');
  }

  get port(): number {
    return this.getNumber('REDIS_PORT');
  }

  get password(): string {
    return this.getString('REDIS_PASSWORD');
  }
}
