import { DeleteFileController } from './delete-file';
import { GeneratePresignedDownloadUrlController } from './generate-presigned-download-url';
import { GeneratePresignedUploadUrlController } from './generate-presigned-upload-url';
import { UploadFileController } from './upload-file';

export * from './delete-file';
export * from './generate-presigned-download-url';
export * from './generate-presigned-upload-url';
export * from './upload-file';

export const storageControllers = [
  UploadFileController,
  GeneratePresignedUploadUrlController,
  GeneratePresignedDownloadUrlController,
  DeleteFileController,
];
