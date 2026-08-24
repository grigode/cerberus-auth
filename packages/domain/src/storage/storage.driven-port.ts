import type { StorageFile } from './storage-file.entity';

export interface UploadedFileResult {
  key: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

export interface PresignedUploadUrlResult {
  uploadUrl: string;
  key: string;
  expiresInSeconds: number;
}

export const STORAGE_DRIVEN_PORT_TOKEN = Symbol('STORAGE_DRIVEN_PORT_TOKEN');

export interface StorageDrivenPort {
  getPresignedDownloadUrl(
    key: string,
    expiresInSeconds?: number,
  ): Promise<string>;
  getPresignedUploadUrl(
    key: string,
    mimetype: string,
    expiresInSeconds?: number,
  ): Promise<PresignedUploadUrlResult>;

  uploadFile(file: StorageFile): Promise<UploadedFileResult>;

  deleteFile(key: string): Promise<void>;
}
