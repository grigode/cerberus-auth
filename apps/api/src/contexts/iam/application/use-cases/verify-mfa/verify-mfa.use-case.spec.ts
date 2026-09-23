import * as speakeasy from 'speakeasy';

import { VerifyMfaUseCase } from './verify-mfa.use-case';
import type { User, UserDrivenPort } from '@core/domain';
import type { AccessTokenDrivenPort, EncryptionDrivenPort } from '@core/domain';
import {
  InvalidMfaCodeException,
  MfaNotEnabledException,
  UserInactiveException,
  UserNotFoundException,
} from '../../exceptions';
import type { CreateSessionUseCase, Session } from '../create-session';

jest.mock('speakeasy');

describe('VerifyMfaUseCase', () => {
  let useCase: VerifyMfaUseCase;
  let userRepositoryMock: jest.Mocked<UserDrivenPort>;
  let accessTokenServiceMock: jest.Mocked<AccessTokenDrivenPort>;
  let encryptionPortMock: jest.Mocked<EncryptionDrivenPort>;
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
      validateAccessToken: jest.fn(),
      decodeToken: jest.fn(),
    };

    encryptionPortMock = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };

    createSessionUseCaseMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateSessionUseCase>;

    useCase = new VerifyMfaUseCase(
      userRepositoryMock,
      accessTokenServiceMock,
      encryptionPortMock,
      createSessionUseCaseMock,
    );
  });

  it('should throw InvalidMfaCodeException if token validation fails', async () => {
    accessTokenServiceMock.validateAccessToken.mockRejectedValue(
      new Error('Invalid token'),
    );

    await expect(
      useCase.execute({ mfaToken: 'invalid-token', code: '123456' }),
    ).rejects.toThrow(InvalidMfaCodeException);
  });

  it('should throw InvalidMfaCodeException if mfaPending is missing in token payload', async () => {
    accessTokenServiceMock.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      mfaPending: false,
    });

    await expect(
      useCase.execute({ mfaToken: 'valid-token', code: '123456' }),
    ).rejects.toThrow(InvalidMfaCodeException);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    accessTokenServiceMock.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      mfaPending: true,
    });
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ mfaToken: 'valid-token', code: '123456' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw UserInactiveException if user is inactive', async () => {
    accessTokenServiceMock.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      mfaPending: true,
    });
    const userMock = {
      data: { isActive: false, email: 'test@example.com' },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({ mfaToken: 'valid-token', code: '123456' }),
    ).rejects.toThrow(UserInactiveException);
  });

  it('should throw MfaNotEnabledException if user MFA is disabled', async () => {
    accessTokenServiceMock.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      mfaPending: true,
    });
    const userMock = {
      data: { isActive: true, isMfaEnabled: false, email: 'test@example.com' },
      isLockedOut: jest.fn().mockReturnValue(false),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({ mfaToken: 'valid-token', code: '123456' }),
    ).rejects.toThrow(MfaNotEnabledException);
  });

  it('should verify MFA code and create session upon success', async () => {
    accessTokenServiceMock.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      mfaPending: true,
    });
    const userMock = {
      data: {
        isActive: true,
        isMfaEnabled: true,
        mfaSecret: 'encrypted-secret',
        email: 'test@example.com',
      },
      isLockedOut: jest.fn().mockReturnValue(false),
      incrementFailedLogin: jest.fn(),
      resetFailedLogin: jest.fn(),
      updateLastLoginAt: jest.fn(),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    encryptionPortMock.decrypt.mockReturnValue('plain-secret');
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
    userRepositoryMock.update.mockResolvedValue(undefined);

    const expectedSession: Session = {
      accessToken: 'acc-token',
      refreshToken: 'ref-token',
    };
    createSessionUseCaseMock.execute.mockResolvedValue(expectedSession);

    const session = await useCase.execute({
      mfaToken: 'valid-token',
      code: '123456',
    });

    expect(session).toEqual(expectedSession);
    expect(userMock.resetFailedLogin).toHaveBeenCalled();
    expect(userMock.updateLastLoginAt).toHaveBeenCalled();
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
    expect(createSessionUseCaseMock.execute).toHaveBeenCalledWith({
      user: userMock,
    });
  });

  it('should throw InvalidMfaCodeException and increment failed login when code is invalid', async () => {
    accessTokenServiceMock.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      mfaPending: true,
    });
    const userMock = {
      data: {
        isActive: true,
        isMfaEnabled: true,
        mfaSecret: 'encrypted-secret',
        email: 'test@example.com',
      },
      isLockedOut: jest.fn().mockReturnValue(false),
      incrementFailedLogin: jest.fn(),
      resetFailedLogin: jest.fn(),
      updateLastLoginAt: jest.fn(),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    encryptionPortMock.decrypt.mockReturnValue('plain-secret');
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);
    userRepositoryMock.update.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ mfaToken: 'valid-token', code: '000000' }),
    ).rejects.toThrow(InvalidMfaCodeException);

    expect(userMock.incrementFailedLogin).toHaveBeenCalled();
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
  });

  it('should throw InvalidMfaCodeException if account is locked out', async () => {
    accessTokenServiceMock.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      mfaPending: true,
    });
    const userMock = {
      data: {
        isActive: true,
        isMfaEnabled: true,
        mfaSecret: 'encrypted-secret',
        email: 'test@example.com',
      },
      isLockedOut: jest.fn().mockReturnValue(true),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({ mfaToken: 'valid-token', code: '123456' }),
    ).rejects.toThrow(InvalidMfaCodeException);
  });
});
