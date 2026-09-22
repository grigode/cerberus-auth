import * as speakeasy from 'speakeasy';

import { DisableMfaUseCase } from './disable-mfa.use-case';
import type { User, UserDrivenPort } from '@core/domain';
import type { EncryptionDrivenPort } from '@core/domain';
import {
  InvalidMfaCodeException,
  MfaNotEnabledException,
  UserNotFoundException,
} from '../../exceptions';

jest.mock('speakeasy');

describe('DisableMfaUseCase', () => {
  let useCase: DisableMfaUseCase;
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

    useCase = new DisableMfaUseCase(userRepositoryMock, encryptionPortMock);
  });

  it('should throw UserNotFoundException if user is not found', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'user-1', code: '123456' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw MfaNotEnabledException if user does not have MFA enabled', async () => {
    const userMock = {
      data: { isMfaEnabled: false, mfaSecret: undefined },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({ userId: 'user-1', code: '123456' }),
    ).rejects.toThrow(MfaNotEnabledException);
  });

  it('should throw InvalidMfaCodeException if code is invalid', async () => {
    const userMock = {
      data: { isMfaEnabled: true, mfaSecret: 'encrypted-secret' },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    encryptionPortMock.decrypt.mockReturnValue('plain-secret');
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

    await expect(
      useCase.execute({ userId: 'user-1', code: '000000' }),
    ).rejects.toThrow(InvalidMfaCodeException);
  });

  it('should disable MFA when valid code is provided', async () => {
    const userMock = {
      data: { isMfaEnabled: true, mfaSecret: 'encrypted-secret' },
      disableMfa: jest.fn(),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    encryptionPortMock.decrypt.mockReturnValue('plain-secret');
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
    userRepositoryMock.update.mockResolvedValue(undefined);

    await useCase.execute({ userId: 'user-1', code: '123456' });

    expect(userMock.disableMfa).toHaveBeenCalled();
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
  });
});
