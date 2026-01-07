import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class SecurityConfigService extends BaseConfigService {
  get CONTENT_SECURITY_POLICY(): boolean {
    return this.getBoolean('CONTENT_SECURITY_POLICY');
  }

  get COOKIE_KEY(): string {
    return this.getString('COOKIE_KEY');
  }

  get CORS_ORIGINS(): string[] {
    return this.getStringArray('CORS_ORIGINS');
  }

  get CORS_CREDENTIALS(): boolean {
    return this.getBoolean('CORS_CREDENTIALS');
  }

  get CORS_METHODS(): string[] {
    return this.getStringArray('CORS_METHODS');
  }
}
