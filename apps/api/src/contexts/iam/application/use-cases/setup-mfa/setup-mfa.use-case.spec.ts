import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';

import { SetupMfaUseCase } from './setup-mfa.use-case';
import type { User, UserDrivenPort } from '@core/domain';
import {
  MfaAlreadyEnabledException,
  UserNotFoundException,
} from '../../exceptions';

jest.mock('speakeasy');
jest.mock('qrcode');

describe('SetupMfaUseCase', () => {
  let useCase: SetupMfaUseCase;
  let userRepositoryMock: jest.Mocked<UserDrivenPort>;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      verifyIfExistsByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    useCase = new SetupMfaUseCase(userRepositoryMock);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'invalid-user-id' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw MfaAlreadyEnabledException if MFA is already enabled', async () => {
    const userMock = {
      data: { isMfaEnabled: true },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(useCase.execute({ userId: 'valid-user-id' })).rejects.toThrow(
      MfaAlreadyEnabledException,
    );
  });

  it('should generate secret and QR code URL', async () => {
    const userMock = {
      data: { isMfaEnabled: false, email: 'test@example.com' },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    (speakeasy.generateSecret as jest.Mock).mockReturnValue({
      base32: 'JBSWY3DPEHPK3PXP',
      otpauth_url:
        'otpauth://totp/App:test@example.com?secret=JBSWY3DPEHPK3PXP',
    });
    (qrcode.toDataURL as jest.Mock).mockResolvedValue(
      'data:image/png;base64,sample',
    );

    const result = await useCase.execute({
      userId: 'valid-user-id',
      appName: 'MyApp',
    });

    expect(result).toEqual({
      secret: 'JBSWY3DPEHPK3PXP',
      qrCodeUrl: 'data:image/png;base64,sample',
    });
  });
});
