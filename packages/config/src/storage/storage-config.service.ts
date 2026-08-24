import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class StorageConfigService extends BaseConfigService {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

  get endpoint(): string {
    return this.getString('STORAGE_S3_ENDPOINT');
  }

  get region(): string {
    return this.getString('STORAGE_S3_REGION');
  }

  get bucket(): string {
    return this.getString('STORAGE_S3_BUCKET');
  }

  get accessKeyId(): string {
    return this.getString('STORAGE_S3_ACCESS_KEY_ID');
  }

  get secretAccessKey(): string {
    return this.getString('STORAGE_S3_SECRET_ACCESS_KEY');
  }

  get forcePathStyle(): boolean {
    return this.getBoolean('STORAGE_S3_FORCE_PATH_STYLE');
  }

  get urlExpirationSeconds(): number {
    return this.getNumber('STORAGE_S3_URL_EXPIRATION_SECONDS');
  }

  get publicUrl(): string {
    return this.getString('STORAGE_S3_PUBLIC_URL');
  }
}
