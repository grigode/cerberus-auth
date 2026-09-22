import { LogoutUseCase } from './logout.use-case';

const mockRefreshTokenRepository = {
  findByToken: jest.fn(),
  update: jest.fn(),
};

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new LogoutUseCase(mockRefreshTokenRepository as any);
  });

  describe('execute', () => {
    it('should revoke the token successfully if valid', async () => {
      const mockTokenEntity = {
        data: {
          id: 'token-uuid-123',
          userId: 'user-id-123',
          token: 'existing-token-123',
          revokedAt: undefined,
        },
        revoke: jest.fn(),
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockTokenEntity);
      mockRefreshTokenRepository.update.mockResolvedValue(undefined);

      await useCase.execute({ refreshToken: 'existing-token-123' });

      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'existing-token-123',
      );
      expect(mockTokenEntity.revoke).toHaveBeenCalled();
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        mockTokenEntity,
      );
    });

    it('should do nothing if token is already revoked', async () => {
      const mockTokenEntity = {
        data: {
          id: 'token-uuid-123',
          userId: 'user-id-123',
          token: 'existing-token-123',
          revokedAt: new Date(),
        },
        revoke: jest.fn(),
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockTokenEntity);

      await useCase.execute({ refreshToken: 'existing-token-123' });

      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'existing-token-123',
      );
      expect(mockTokenEntity.revoke).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
    });

    it('should do nothing if token is not found', async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await useCase.execute({ refreshToken: 'non-existing-token' });

      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'non-existing-token',
      );
      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
    });

    it('should do nothing if no token is provided', async () => {
      await useCase.execute({});

      expect(mockRefreshTokenRepository.findByToken).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
    });
  });
});
