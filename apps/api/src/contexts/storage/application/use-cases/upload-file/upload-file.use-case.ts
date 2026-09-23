import { extname } from 'node:path';

import {
  generateUuid,
  type StorageDrivenPort,
  StorageFile,
  type UploadedFileResult,
} from '@core/domain';

import type { UploadFileOptions } from './upload-file.dto';

export class UploadFileUseCase {
  constructor(private readonly storagePort: StorageDrivenPort) {}

  async execute(
    file: { originalname: string; mimetype: string; buffer: Buffer },
    options?: UploadFileOptions,
  ): Promise<UploadedFileResult> {
    const ext = extname(file.originalname).toLowerCase();
    const filename = `${generateUuid()}${ext}`;

    const storageFile = new StorageFile({
      filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer,
      path: options?.path,
    });

    return await this.storagePort.uploadFile(storageFile);
  }
}
