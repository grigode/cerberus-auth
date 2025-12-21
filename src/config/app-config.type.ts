import { DataSourceOptions } from 'typeorm';

export interface SuperAdminCredentialsI {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AppConfigI {
  get APP_NAME(): string;
  get PORT(): number;
  get GLOBAL_PREFIX(): string;
  get CONTENT_SECURITY_POLICY(): boolean;

  // SEED DATABASE

  get SUPERADMIN_CREDENTIALS(): SuperAdminCredentialsI;

  // KEYS

  get COOKIE_KEY(): string;

  // CORS
  get CORS_ORIGINS(): string[];
  get CORS_CREDENTIALS(): boolean;
  get CORS_METHODS(): string[];

  // DATABASE
  get MAIN_DATABASE_SOURCE(): DataSourceOptions;
}
