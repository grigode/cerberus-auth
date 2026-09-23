import { extname } from 'node:path';

import {
  generateUuid,
  type PresignedUploadUrlResult,
  type StorageDrivenPort,
} from '@core/domain';

import type { GeneratePresignedUploadUrlDto } from './generate-presigned-upload-url.dto';

export class GeneratePresignedUploadUrlUseCase {
  constructor(private readonly storagePort: StorageDrivenPort) {}

  async execute(
    dto: GeneratePresignedUploadUrlDto,
  ): Promise<PresignedUploadUrlResult> {
    const ext = extname(dto.filename).toLowerCase();
    const generatedFilename = `${generateUuid()}${ext}`;

    const key = dto.path
      ? `${dto.path.replace(/^\/+|\/+$/g, '')}/${generatedFilename}`
      : generatedFilename;

    return await this.storagePort.getPresignedUploadUrl(
      key,
      dto.mimetype,
      dto.expiresInSeconds,
    );
  }
}
