import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

import { AppConfigI } from './app-config.type';

@Injectable()
export class AppConfigService implements AppConfigI {
  constructor(private readonly configService: ConfigService) {}

  get APP_NAME(): string {
    return this.getString('APP_NAME', 'Cerberus Auth');
  }

  get PORT(): number {
    return this.getNumber('PORT', 8000);
  }

  get GLOBAL_PREFIX(): string {
    return 'api';
  }

  get CONTENT_SECURITY_POLICY(): boolean {
    return this.getBoolean('CONTENT_SECURITY_POLICY', false);
  }

  // KEYS

  get COOKIE_KEY(): string {
    return this.getString('COOKIE_KEY', 'default_cookie_key');
  }

  // CORS

  get CORS_ORIGINS(): string[] {
    return this.getArrayString('CORS_ORIGINS', []);
  }

  get CORS_CREDENTIALS(): boolean {
    return this.getBoolean('CORS_CREDENTIALS', false);
  }

  get CORS_METHODS(): string[] {
    return this.getArrayString('CORS_METHODS', []);
  }

  // DATABASE

  get MAIN_DATABASE_SOURCE(): DataSourceOptions {
    return {
      type: 'mysql',
      host: this.getString('MAIN_DATABASE_HOST', 'localhost'),
      port: this.getNumber('MAIN_DATABASE_PORT', 3306),
      username: this.getString('MAIN_DATABASE_USERNAME', 'root'),
      password: this.getString('MAIN_DATABASE_PASSWORD', '<password>'),
      database: this.getString('MAIN_DATABASE_DATABASE', 'cerberus-auth'),
      entities: [__dirname + '/../**/*.db-entity.ts'],
      synchronize: this.getBoolean('MAIN_DATABASE_DATABASE', true),
      timezone: this.getString('MAIN_DATABASE_TIMEZONE', 'z'),
    };
  }

  // Getters

  private getString(key: string, _default: string): string {
    const value = this.configService.get<string>(key);
    return value || _default;
  }

  private getArrayString(key: string, _default: string[]): string[] {
    const value = this.configService.get<string>(key);
    return this.parseArrayString(value) || _default;
  }

  private getNumber(key: string, _default: number): number {
    const value = this.parseNumber(this.configService.get<string>(key));
    return value || _default;
  }

  private getBoolean(key: string, _default: boolean): boolean {
    const value = this.configService.get<string>(key);
    return value ? this.parseBoolean(value) : _default;
  }

  // Parsers

  private parseNumber(value?: string): number | undefined {
    if (value) return Number(value);
  }

  private parseArrayString(value?: string): Array<string> | undefined {
    if (value) return value.split(',');
  }

  private parseBoolean(value?: string): boolean {
    if (!value) return false;

    return ['1', 'true'].includes(value?.toLocaleLowerCase());
  }
}
