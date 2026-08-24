import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class MailConfigService extends BaseConfigService {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

  get host(): string {
    return this.getString('SMTP_HOST');
  }

  get port(): number {
    return this.getNumber('SMTP_PORT');
  }

  get user(): string {
    return this.getString('SMTP_USER');
  }

  get pass(): string {
    return this.getString('SMTP_PASS');
  }

  get secure(): boolean {
    return this.getBoolean('SMTP_SECURE');
  }

  get fromName(): string {
    return this.getString('SMTP_FROM_NAME');
  }

  get fromEmail(): string {
    return this.getString('SMTP_FROM_EMAIL');
  }

  get from(): string {
    return `"${this.fromName}" <${this.fromEmail}>`;
  }
}
