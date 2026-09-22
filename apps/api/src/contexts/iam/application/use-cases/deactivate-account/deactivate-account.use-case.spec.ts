import { DeactivateAccountUseCase } from './deactivate-account.use-case';
import type {
  RefreshTokenDrivenPort,
  User,
  UserDrivenPort,
} from '@core/domain';
import { UserNotFoundException } from '../../exceptions';

describe('DeactivateAccountUseCase', () => {
  let useCase: DeactivateAccountUseCase;
  let userRepositoryMock: jest.Mocked<UserDrivenPort>;
  let refreshTokenRepositoryMock: jest.Mocked<RefreshTokenDrivenPort>;

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
      findByToken: jest.fn(),
      findAllActiveByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      revokeById: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    useCase = new DeactivateAccountUseCase(
      userRepositoryMock,
      refreshTokenRepositoryMock,
    );
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'invalid-user-id' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should deactivate account and revoke all refresh tokens', async () => {
    const userMock = {
      toggleIsActive: jest.fn(),
    } as unknown as User;

    userRepositoryMock.findById.mockResolvedValue(userMock);
    userRepositoryMock.update.mockResolvedValue(undefined);
    refreshTokenRepositoryMock.revokeAllByUserId.mockResolvedValue(undefined);

    await useCase.execute({ userId: 'valid-user-id' });

    expect(userMock.toggleIsActive).toHaveBeenCalled();
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userMock);
    expect(refreshTokenRepositoryMock.revokeAllByUserId).toHaveBeenCalledWith(
      'valid-user-id',
    );
  });
});
