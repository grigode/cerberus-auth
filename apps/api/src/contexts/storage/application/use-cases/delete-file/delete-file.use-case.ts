import type { StorageDrivenPort } from '@core/domain';

export class DeleteFileUseCase {
  constructor(private readonly storagePort: StorageDrivenPort) {}

  async execute(key: string): Promise<void> {
    await this.storagePort.deleteFile(key);
  }
}
