import { GenerateMfaBackupCodesUseCase } from './generate-mfa-backup-codes.use-case';
import type { HashingDrivenPort, User, UserDrivenPort } from '@core/domain';
import {
  MfaNotEnabledException,
  UserNotFoundException,
} from '../../exceptions';

describe('GenerateMfaBackupCodesUseCase', () => {
  let useCase: GenerateMfaBackupCodesUseCase;
  let userRepositoryMock: jest.Mocked<UserDrivenPort>;
  let hashingPortMock: jest.Mocked<HashingDrivenPort>;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      verifyIfExistsByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    hashingPortMock = {
      hash: jest
        .fn()
        .mockImplementation((code: string) =>
          Promise.resolve(`hashed-${code}`),
        ),
      compare: jest.fn().mockResolvedValue(true),
    };

    useCase = new GenerateMfaBackupCodesUseCase(
      userRepositoryMock,
      hashingPortMock,
    );
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'non-existent' })).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('should throw MfaNotEnabledException when user does not have MFA enabled', async () => {
    const userMock = {
      data: { isMfaEnabled: false },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow(
      MfaNotEnabledException,
    );
  });

  it('should generate 8 backup codes, hash them, and update user', async () => {
    const userMock = {
      data: { isMfaEnabled: true },
      setBackupCodes: jest.fn(),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    userRepositoryMock.update.mockResolvedValue(undefined);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.backupCodes).toHaveLength(8);
    expect(hashingPortMock.hash).toHaveBeenCalledTimes(8);
    expect(userMock.setBackupCodes).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringMatching(/^hashed-/)]),
    );
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
  });
});
