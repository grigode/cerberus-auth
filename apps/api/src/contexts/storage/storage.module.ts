import { Module } from '@nestjs/common';
import { ConfigModule } from '@core/config';
import {
  STORAGE_DRIVEN_PORT_TOKEN,
  type StorageDrivenPort,
} from '@core/domain';

import {
  DeleteFileUseCase,
  GeneratePresignedDownloadUrlUseCase,
  GeneratePresignedUploadUrlUseCase,
  UploadFileUseCase,
  useCases,
} from './application';
import { S3StorageAdapter, storageControllers } from './infrastructure';

@Module({
  imports: [ConfigModule],
  controllers: [...storageControllers],
  providers: [
    S3StorageAdapter,
    {
      provide: STORAGE_DRIVEN_PORT_TOKEN,
      useExisting: S3StorageAdapter,
    },
    {
      provide: UploadFileUseCase,
      useFactory: (storagePort: StorageDrivenPort) =>
        new UploadFileUseCase(storagePort),
      inject: [STORAGE_DRIVEN_PORT_TOKEN],
    },
    {
      provide: GeneratePresignedUploadUrlUseCase,
      useFactory: (storagePort: StorageDrivenPort) =>
        new GeneratePresignedUploadUrlUseCase(storagePort),
      inject: [STORAGE_DRIVEN_PORT_TOKEN],
    },
    {
      provide: GeneratePresignedDownloadUrlUseCase,
      useFactory: (storagePort: StorageDrivenPort) =>
        new GeneratePresignedDownloadUrlUseCase(storagePort),
      inject: [STORAGE_DRIVEN_PORT_TOKEN],
    },
    {
      provide: DeleteFileUseCase,
      useFactory: (storagePort: StorageDrivenPort) =>
        new DeleteFileUseCase(storagePort),
      inject: [STORAGE_DRIVEN_PORT_TOKEN],
    },
  ],
  exports: [STORAGE_DRIVEN_PORT_TOKEN, ...useCases],
})
export class StorageModule {}
