import { ChangePasswordUseCase } from './change-password.use-case';
import type {
  HashingDrivenPort,
  RefreshTokenDrivenPort,
  User,
  UserDrivenPort,
} from '@core/domain';
import {
  CannotReuseCurrentPasswordException,
  InvalidCredentialsException,
  UserNotFoundException,
} from '../../exceptions';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepositoryMock: jest.Mocked<UserDrivenPort>;
  let refreshTokenRepositoryMock: jest.Mocked<RefreshTokenDrivenPort>;
  let hashingPortMock: jest.Mocked<HashingDrivenPort>;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      verifyIfExistsByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    refreshTokenRepositoryMock = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByToken: jest.fn(),
      findAllActiveByUserId: jest.fn(),
      revokeById: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    hashingPortMock = {
      hash: jest.fn().mockResolvedValue('hashed-new-password'),
      compare: jest.fn().mockResolvedValue(false),
    };

    useCase = new ChangePasswordUseCase(
      userRepositoryMock,
      refreshTokenRepositoryMock,
      hashingPortMock,
    );
  });

  it('should throw UserNotFoundException if user is not found', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-123',
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw InvalidCredentialsException if current password is wrong', async () => {
    const userMock = {
      verifyPassword: jest.fn().mockResolvedValue(false),
      updatePassword: jest.fn(),
      data: { hashedPassword: 'hashed-old-password' },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({
        userId: 'user-123',
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword123!',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw CannotReuseCurrentPasswordException if new password equals current password string', async () => {
    const userMock = {
      verifyPassword: jest.fn().mockResolvedValue(true),
      updatePassword: jest.fn(),
      data: { hashedPassword: 'hashed-old-password' },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);

    await expect(
      useCase.execute({
        userId: 'user-123',
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
      }),
    ).rejects.toThrow(CannotReuseCurrentPasswordException);
  });

  it('should throw CannotReuseCurrentPasswordException if new password matches existing password hash', async () => {
    const userMock = {
      verifyPassword: jest.fn().mockResolvedValue(true),
      updatePassword: jest.fn(),
      data: { hashedPassword: 'hashed-old-password' },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    hashingPortMock.compare.mockResolvedValue(true);

    await expect(
      useCase.execute({
        userId: 'user-123',
        currentPassword: 'OldPassword123!',
        newPassword: 'OldPassword123!Variant',
      }),
    ).rejects.toThrow(CannotReuseCurrentPasswordException);
  });

  it('should update password and revoke all sessions when current password is valid and not reused', async () => {
    const userMock = {
      verifyPassword: jest.fn().mockResolvedValue(true),
      updatePassword: jest.fn(),
      data: { hashedPassword: 'hashed-old-password' },
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    userRepositoryMock.update.mockResolvedValue(undefined);
    refreshTokenRepositoryMock.revokeAllByUserId.mockResolvedValue(undefined);

    await useCase.execute({
      userId: 'user-123',
      currentPassword: 'ValidOldPassword123!',
      newPassword: 'NewStrongPassword123!',
    });

    expect(hashingPortMock.hash).toHaveBeenCalledWith('NewStrongPassword123!');
    expect(userMock.updatePassword).toHaveBeenCalledWith('hashed-new-password');
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
    expect(refreshTokenRepositoryMock.revokeAllByUserId).toHaveBeenCalledWith(
      'user-123',
    );
  });
});
