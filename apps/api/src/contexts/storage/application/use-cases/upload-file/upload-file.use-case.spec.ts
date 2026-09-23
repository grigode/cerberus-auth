import {
  type StorageDrivenPort,
  StorageFile,
  type UploadedFileResult,
} from '@core/domain';
import { UploadFileUseCase } from './upload-file.use-case';

describe('UploadFileUseCase', () => {
  let useCase: UploadFileUseCase;
  let storagePortMock: jest.Mocked<StorageDrivenPort>;

  beforeEach(() => {
    storagePortMock = {
      uploadFile: jest.fn(),
      getPresignedUploadUrl: jest.fn(),
      getPresignedDownloadUrl: jest.fn(),
      deleteFile: jest.fn(),
    };

    useCase = new UploadFileUseCase(storagePortMock);
  });

  it('should generate a unique filename and upload file via storage port', async () => {
    const fileData = {
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test-image'),
    };

    const expectedResult: UploadedFileResult = {
      key: 'avatars/uuid-avatar.jpg',
      filename: 'uuid-avatar.jpg',
      url: 'https://storage.example.com/avatars/uuid-avatar.jpg',
      mimetype: 'image/jpeg',
      size: 10,
    };

    storagePortMock.uploadFile.mockResolvedValue(expectedResult);

    const result = await useCase.execute(fileData, { path: 'avatars' });

    expect(result).toEqual(expectedResult);
    expect(storagePortMock.uploadFile).toHaveBeenCalledWith(
      expect.any(StorageFile),
    );
  });
});
