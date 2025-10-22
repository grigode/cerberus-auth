export interface AppConfigI {
  get APP_NAME(): string;
  get PORT(): number;
  get GLOBAL_PREFIX(): string;

  // KEYS

  get COOKIE_KEY(): string;

  // CORS
  get CORS_ORIGINS(): string[];
  get CORS_CREDENTIALS(): boolean;
  get CORS_METHODS(): string[];
}
