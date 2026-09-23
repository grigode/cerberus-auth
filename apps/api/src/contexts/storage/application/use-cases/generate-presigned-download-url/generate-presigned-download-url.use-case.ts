import type { StorageDrivenPort } from '@core/domain';

export class GeneratePresignedDownloadUrlUseCase {
  constructor(private readonly storagePort: StorageDrivenPort) {}

  async execute(key: string, expiresInSeconds?: number): Promise<string> {
    return await this.storagePort.getPresignedDownloadUrl(
      key,
      expiresInSeconds,
    );
  }
}
