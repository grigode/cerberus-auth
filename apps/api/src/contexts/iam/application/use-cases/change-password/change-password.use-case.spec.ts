import { ChangePasswordUseCase } from './change-password.use-case';
import type { User, UserDrivenPort } from '@core/domain';
import {
  InvalidCredentialsException,
  UserNotFoundException,
} from '../../exceptions';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepositoryMock: jest.Mocked<UserDrivenPort>;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      verifyIfExistsByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    useCase = new ChangePasswordUseCase(userRepositoryMock);
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

  it('should update password when current password is valid', async () => {
    const userMock = {
      verifyPassword: jest.fn().mockResolvedValue(true),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    userRepositoryMock.update.mockResolvedValue(undefined);

    await useCase.execute({
      userId: 'user-123',
      currentPassword: 'ValidOldPassword123!',
      newPassword: 'NewStrongPassword123!',
    });

    expect(userMock.updatePassword).toHaveBeenCalledWith(
      'NewStrongPassword123!',
    );
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
  });
});
