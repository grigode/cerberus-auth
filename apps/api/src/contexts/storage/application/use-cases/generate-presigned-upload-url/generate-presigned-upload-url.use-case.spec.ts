import type { PresignedUploadUrlResult, StorageDrivenPort } from '@core/domain';
import { GeneratePresignedUploadUrlUseCase } from './generate-presigned-upload-url.use-case';

describe('GeneratePresignedUploadUrlUseCase', () => {
  let useCase: GeneratePresignedUploadUrlUseCase;
  let storagePortMock: jest.Mocked<StorageDrivenPort>;

  beforeEach(() => {
    storagePortMock = {
      uploadFile: jest.fn(),
      getPresignedUploadUrl: jest.fn(),
      getPresignedDownloadUrl: jest.fn(),
      deleteFile: jest.fn(),
    };

    useCase = new GeneratePresignedUploadUrlUseCase(storagePortMock);
  });

  it('should generate presigned upload URL with formatted object key', async () => {
    const expectedResult: PresignedUploadUrlResult = {
      uploadUrl:
        'https://s3.amazonaws.com/bucket/uploads/file.png?signature=123',
      key: 'uploads/generated-uuid.png',
      expiresInSeconds: 900,
    };

    storagePortMock.getPresignedUploadUrl.mockResolvedValue(expectedResult);

    const result = await useCase.execute({
      filename: 'file.png',
      mimetype: 'image/png',
      path: 'uploads',
      expiresInSeconds: 900,
    });

    expect(result).toEqual(expectedResult);
    expect(storagePortMock.getPresignedUploadUrl).toHaveBeenCalled();
  });
});
