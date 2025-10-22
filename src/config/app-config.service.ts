import { ConfigService } from '@nestjs/config';

import { AppConfigI } from './app-config.type';

export class AppConfigService implements AppConfigI {
  constructor(private readonly configService: ConfigService) {}

  get APP_NAME(): string {
    return this.configService.get<string>('APP_NAME') || 'Cerberus Auth';
  }

  get PORT(): number {
    const port = this.configService.get<number>('PORT');
    return Number(port) || 8000;
  }

  get GLOBAL_PREFIX(): string {
    return 'api';
  }

  // KEYS

  get COOKIE_KEY(): string {
    return this.configService.get<string>('COOKIE_KEY') || 'default_cookie_key';
  }

  // CORS

  get CORS_ORIGINS(): string[] {
    const origins = this.parseArrayString(
      this.configService.get<string>('CORS_ORIGINS'),
    );

    return origins || [];
  }

  get CORS_CREDENTIALS(): boolean {
    const credentials = this.configService.get<string>('CORS_CREDENTIALS');

    if (!credentials) return false;

    return ['1', 'true'].includes(credentials?.toLocaleLowerCase());
  }

  get CORS_METHODS(): string[] {
    const methods = this.parseArrayString(
      this.configService.get<string>('CORS_METHODS'),
    );

    return methods || [];
  }

  private parseArrayString(value?: string): Array<string> | undefined {
    if (value) return value.split(',');
  }
}
