import * as speakeasy from 'speakeasy';

import { EnableMfaUseCase } from './enable-mfa.use-case';
import type { User, UserDrivenPort } from '@core/domain';
import type { EncryptionDrivenPort } from '@core/domain';
import {
  InvalidMfaCodeException,
  MfaAlreadyEnabledException,
  UserNotFoundException,
} from '../../exceptions';

jest.mock('speakeasy');

describe('EnableMfaUseCase', () => {
  let useCase: EnableMfaUseCase;
  let userRepositoryMock: jest.Mocked<UserDrivenPort>;
  let encryptionPortMock: jest.Mocked<EncryptionDrivenPort>;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      verifyIfExistsByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    encryptionPortMock = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };

    useCase = new EnableMfaUseCase(userRepositoryMock, encryptionPortMock);
  });

  it('should throw UserNotFoundException if user is not found', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        secret: 'plain-secret',
        code: '123456',
      }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw MfaAlreadyEnabledException if MFA is already active', async () => {
    const userMock = {
      data: { isMfaEnabled: true },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({
        userId: 'user-1',
        secret: 'plain-secret',
        code: '123456',
      }),
    ).rejects.toThrow(MfaAlreadyEnabledException);
  });

  it('should throw InvalidMfaCodeException if code is invalid', async () => {
    const userMock = {
      data: { isMfaEnabled: false },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

    await expect(
      useCase.execute({
        userId: 'user-1',
        secret: 'plain-secret',
        code: '000000',
      }),
    ).rejects.toThrow(InvalidMfaCodeException);
  });

  it('should enable MFA and encrypt secret when valid code is provided', async () => {
    const userMock = {
      data: { isMfaEnabled: false },
      enableMfa: jest.fn(),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
    encryptionPortMock.encrypt.mockReturnValue('encrypted-secret');
    userRepositoryMock.update.mockResolvedValue(undefined);

    await useCase.execute({
      userId: 'user-1',
      secret: 'plain-secret',
      code: '123456',
    });

    expect(encryptionPortMock.encrypt).toHaveBeenCalledWith('plain-secret');
    expect(userMock.enableMfa).toHaveBeenCalledWith('encrypted-secret');
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
  });
});
