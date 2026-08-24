import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class SecurityConfigService extends BaseConfigService {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

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

  get JWT_SECRET(): string {
    return this.getString('JWT_SECRET');
  }

  get ENCRYPTION_KEY(): string {
    return this.getString('ENCRYPTION_KEY');
  }

  get GOOGLE_CLIENT_ID(): string {
    return this.getString('GOOGLE_CLIENT_ID');
  }

  get GOOGLE_CLIENT_SECRET(): string {
    return this.getString('GOOGLE_CLIENT_SECRET');
  }

  get GOOGLE_CALLBACK_URL(): string {
    return this.getString('GOOGLE_CALLBACK_URL');
  }

  get GOOGLE_REDIRECT_FRONTEND_URL(): string {
    return this.getString('GOOGLE_REDIRECT_FRONTEND_URL');
  }

  get THROTTLE_TTL(): number {
    return this.getNumber('THROTTLE_TTL');
  }

  get THROTTLE_LIMIT(): number {
    return this.getNumber('THROTTLE_LIMIT');
  }

  get THROTTLE_AUTH_TTL(): number {
    return this.getNumber('THROTTLE_AUTH_TTL');
  }

  get THROTTLE_AUTH_LIMIT(): number {
    return this.getNumber('THROTTLE_AUTH_LIMIT');
  }

  get THROTTLE_EMAIL_TTL(): number {
    return this.getNumber('THROTTLE_EMAIL_TTL');
  }

  get THROTTLE_EMAIL_LIMIT(): number {
    return this.getNumber('THROTTLE_EMAIL_LIMIT');
  }
}
