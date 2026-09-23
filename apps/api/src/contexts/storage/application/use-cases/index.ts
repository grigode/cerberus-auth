import { DeleteFileUseCase } from './delete-file';
import { GeneratePresignedDownloadUrlUseCase } from './generate-presigned-download-url';
import { GeneratePresignedUploadUrlUseCase } from './generate-presigned-upload-url';
import { UploadFileUseCase } from './upload-file';

export * from './delete-file';
export * from './generate-presigned-download-url';
export * from './generate-presigned-upload-url';
export * from './upload-file';

export const useCases = [
  UploadFileUseCase,
  GeneratePresignedUploadUrlUseCase,
  GeneratePresignedDownloadUrlUseCase,
  DeleteFileUseCase,
];
