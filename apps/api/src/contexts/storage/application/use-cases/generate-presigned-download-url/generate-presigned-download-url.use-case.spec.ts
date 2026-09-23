import type { StorageDrivenPort } from '@core/domain';
import { GeneratePresignedDownloadUrlUseCase } from './generate-presigned-download-url.use-case';

describe('GeneratePresignedDownloadUrlUseCase', () => {
  let useCase: GeneratePresignedDownloadUrlUseCase;
  let storagePortMock: jest.Mocked<StorageDrivenPort>;

  beforeEach(() => {
    storagePortMock = {
      uploadFile: jest.fn(),
      getPresignedUploadUrl: jest.fn(),
      getPresignedDownloadUrl: jest.fn(),
      deleteFile: jest.fn(),
    };

    useCase = new GeneratePresignedDownloadUrlUseCase(storagePortMock);
  });

  it('should delegate download URL generation to storage port', async () => {
    const expectedUrl = 'https://s3.amazonaws.com/bucket/files/doc.pdf?sig=abc';
    storagePortMock.getPresignedDownloadUrl.mockResolvedValue(expectedUrl);

    const result = await useCase.execute('files/doc.pdf', 3600);

    expect(result).toBe(expectedUrl);
    expect(storagePortMock.getPresignedDownloadUrl).toHaveBeenCalledWith(
      'files/doc.pdf',
      3600,
    );
  });
});
