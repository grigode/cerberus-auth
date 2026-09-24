import { ConfigService } from '@nestjs/config';

export abstract class BaseConfigService {
  constructor(protected readonly configService: ConfigService) {}

  protected getString(key: string): string {
    const value: unknown = this.configService.getOrThrow(key, { infer: true });

    if (typeof value !== 'string') {
      throw new Error(`Config key "${key}" must be a string`);
    }

    return value;
  }

  protected getNumber(key: string): number {
    const value: unknown = this.configService.getOrThrow(key, { infer: true });

    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    throw new Error(`Config key "${key}" must be a number`);
  }

  protected getBoolean(key: string): boolean {
    const value: unknown = this.configService.getOrThrow(key, { infer: true });

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'true' || lower === '1') {
        return true;
      }
      if (lower === 'false' || lower === '0') {
        return false;
      }
    }

    throw new Error(`Config key "${key}" must be a boolean`);
  }

  protected getStringArray(key: string, separator = ','): string[] {
    const value: unknown = this.configService.getOrThrow(key, { infer: true });

    if (typeof value !== 'string') {
      throw new Error(`Config key "${key}" must be a string`);
    }

    return value
      .split(separator)
      .map((v) => v.trim())
      .filter(Boolean);
  }
}
