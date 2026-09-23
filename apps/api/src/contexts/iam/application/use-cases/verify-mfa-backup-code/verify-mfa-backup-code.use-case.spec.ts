import { VerifyMfaBackupCodeUseCase } from './verify-mfa-backup-code.use-case';
import type {
  AccessTokenDrivenPort,
  HashingDrivenPort,
  User,
  UserDrivenPort,
} from '@core/domain';
import {
  InvalidMfaCodeException,
  MfaNotEnabledException,
  UserInactiveException,
  UserNotFoundException,
} from '../../exceptions';
import type { CreateSessionUseCase } from '../create-session';

describe('VerifyMfaBackupCodeUseCase', () => {
  let useCase: VerifyMfaBackupCodeUseCase;
  let userRepositoryMock: jest.Mocked<UserDrivenPort>;
  let accessTokenServiceMock: jest.Mocked<AccessTokenDrivenPort>;
  let hashingPortMock: jest.Mocked<HashingDrivenPort>;
  let createSessionUseCaseMock: jest.Mocked<CreateSessionUseCase>;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      verifyIfExistsByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    accessTokenServiceMock = {
      generateAccessToken: jest.fn(),
      validateAccessToken: jest.fn().mockResolvedValue({
        sub: 'user-1',
        mfaPending: true,
      }),
      decodeToken: jest.fn(),
    };

    hashingPortMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    createSessionUseCaseMock = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    } as unknown as jest.Mocked<CreateSessionUseCase>;

    useCase = new VerifyMfaBackupCodeUseCase(
      userRepositoryMock,
      accessTokenServiceMock,
      hashingPortMock,
      createSessionUseCaseMock,
    );
  });

  it('should throw InvalidMfaCodeException when accessTokenService fails', async () => {
    accessTokenServiceMock.validateAccessToken.mockRejectedValue(new Error());

    await expect(
      useCase.execute({ mfaToken: 'bad-token', code: 'CODE123' }),
    ).rejects.toThrow(InvalidMfaCodeException);
  });

  it('should throw InvalidMfaCodeException when mfaPending is false', async () => {
    accessTokenServiceMock.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      mfaPending: false,
    });

    await expect(
      useCase.execute({ mfaToken: 'token', code: 'CODE123' }),
    ).rejects.toThrow(InvalidMfaCodeException);
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ mfaToken: 'token', code: 'CODE123' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw UserInactiveException when user is inactive', async () => {
    const userMock = {
      data: { isActive: false, email: 'user@test.com' },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({ mfaToken: 'token', code: 'CODE123' }),
    ).rejects.toThrow(UserInactiveException);
  });

  it('should throw InvalidMfaCodeException when user is locked out', async () => {
    const userMock = {
      data: { isActive: true, email: 'user@test.com' },
      isLockedOut: jest.fn().mockReturnValue(true),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({ mfaToken: 'token', code: 'CODE123' }),
    ).rejects.toThrow(InvalidMfaCodeException);
  });

  it('should throw MfaNotEnabledException when MFA is not enabled', async () => {
    const userMock = {
      data: { isActive: true, isMfaEnabled: false, email: 'user@test.com' },
      isLockedOut: jest.fn().mockReturnValue(false),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({ mfaToken: 'token', code: 'CODE123' }),
    ).rejects.toThrow(MfaNotEnabledException);
  });

  it('should throw InvalidMfaCodeException and increment failed attempts when code does not match', async () => {
    const userMock = {
      data: {
        isActive: true,
        isMfaEnabled: true,
        email: 'user@test.com',
        mfaBackupCodes: ['hash1', 'hash2'],
      },
      isLockedOut: jest.fn().mockReturnValue(false),
      incrementFailedLogin: jest.fn(),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    hashingPortMock.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ mfaToken: 'token', code: 'WRONGCODE' }),
    ).rejects.toThrow(InvalidMfaCodeException);

    expect(userMock.incrementFailedLogin).toHaveBeenCalled();
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
  });

  it('should consume backup code and create session when code matches', async () => {
    const userMock = {
      data: {
        isActive: true,
        isMfaEnabled: true,
        email: 'user@test.com',
        mfaBackupCodes: ['hash1', 'hash2'],
      },
      isLockedOut: jest.fn().mockReturnValue(false),
      consumeBackupCode: jest.fn(),
      resetFailedLogin: jest.fn(),
      updateLastLoginAt: jest.fn(),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    hashingPortMock.compare.mockImplementation((plain, hash) =>
      Promise.resolve(hash === 'hash2' && plain === 'CORRECTCODE'),
    );

    const result = await useCase.execute({
      mfaToken: 'token',
      code: 'CORRECTCODE',
    });

    expect(userMock.consumeBackupCode).toHaveBeenCalledWith(1);
    expect(userMock.resetFailedLogin).toHaveBeenCalled();
    expect(userMock.updateLastLoginAt).toHaveBeenCalled();
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
    expect(createSessionUseCaseMock.execute).toHaveBeenCalled();
    expect(result).toHaveProperty('accessToken');
  });
});
