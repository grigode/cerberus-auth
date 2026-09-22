import { LogoutAllUseCase } from './logout-all.use-case';
import type { RefreshTokenDrivenPort } from '@core/domain';

describe('LogoutAllUseCase', () => {
  let useCase: LogoutAllUseCase;
  let refreshTokenRepositoryMock: jest.Mocked<RefreshTokenDrivenPort>;

  beforeEach(() => {
    refreshTokenRepositoryMock = {
      findById: jest.fn(),
      findByToken: jest.fn(),
      findAllActiveByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      revokeById: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    useCase = new LogoutAllUseCase(refreshTokenRepositoryMock);
  });

  it('should revoke all active sessions for the user', async () => {
    refreshTokenRepositoryMock.revokeAllByUserId.mockResolvedValue(undefined);

    await useCase.execute({ userId: 'user-123' });

    expect(refreshTokenRepositoryMock.revokeAllByUserId).toHaveBeenCalledWith(
      'user-123',
    );
  });
});
