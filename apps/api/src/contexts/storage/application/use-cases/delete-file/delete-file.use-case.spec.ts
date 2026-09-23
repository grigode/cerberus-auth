import type { StorageDrivenPort } from '@core/domain';
import { DeleteFileUseCase } from './delete-file.use-case';

describe('DeleteFileUseCase', () => {
  let useCase: DeleteFileUseCase;
  let storagePortMock: jest.Mocked<StorageDrivenPort>;

  beforeEach(() => {
    storagePortMock = {
      uploadFile: jest.fn(),
      getPresignedUploadUrl: jest.fn(),
      getPresignedDownloadUrl: jest.fn(),
      deleteFile: jest.fn(),
    };

    useCase = new DeleteFileUseCase(storagePortMock);
  });

  it('should delegate file deletion to storage port', async () => {
    storagePortMock.deleteFile.mockResolvedValue(undefined);

    await useCase.execute('uploads/image.png');

    expect(storagePortMock.deleteFile).toHaveBeenCalledWith(
      'uploads/image.png',
    );
  });
});
