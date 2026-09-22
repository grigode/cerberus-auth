import { RotateSessionUseCase } from './rotate-session.use-case';
import { InvalidRefreshTokenException } from '../../exceptions';

const mockRefreshTokenRepository = {
  findByToken: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  revokeAllByUserId: jest.fn(),
};

const mockAccessTokenService = {
  generateAccessToken: jest.fn(),
};

jest.mock('@core/domain', () => ({
  ...jest.requireActual('@core/domain'),
  RefreshToken: jest.fn().mockImplementation((props) => ({
    revoke: jest.fn(),
    data: {
      userId: props.userId,
      token: 'new-refresh-token-123',
      expiresAt: props.expiresAt ?? new Date(),
      revokedAt: props.revokedAt,
    },
  })),
}));

describe('RotateSessionUseCase', () => {
  let useCase: RotateSessionUseCase;
  let defaultDto: { refreshToken: string };

  beforeEach(() => {
    jest.clearAllMocks();

    defaultDto = {
      refreshToken: 'existing-refresh-token-123',
    };

    mockAccessTokenService.generateAccessToken.mockResolvedValue(
      'new-access-token-123',
    );

    useCase = new RotateSessionUseCase(
      mockRefreshTokenRepository as any,
      mockAccessTokenService as any,
    );
  });

  describe('execute', () => {
    it('should rotate session successfully', async () => {
      const mockTokenData = {
        id: 'token-uuid-123',
        userId: 'user-id-123',
        token: 'existing-refresh-token-123',
        revokedAt: undefined,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour in future
      };

      const mockTokenEntity = {
        data: mockTokenData,
        revoke: jest.fn(),
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockTokenEntity);
      mockRefreshTokenRepository.update.mockResolvedValue(undefined);
      mockRefreshTokenRepository.create.mockResolvedValue(undefined);

      const result = await useCase.execute(defaultDto);

      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'existing-refresh-token-123',
      );
      expect(mockTokenEntity.revoke).toHaveBeenCalled();
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        mockTokenEntity,
      );
      expect(mockAccessTokenService.generateAccessToken).toHaveBeenCalledWith(
        'user-id-123',
      );
      expect(mockRefreshTokenRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'new-access-token-123',
        refreshToken: 'new-refresh-token-123',
      });
    });

    it('should throw InvalidRefreshTokenException if token is not found', async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidRefreshTokenException,
      );

      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
      expect(mockAccessTokenService.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should throw InvalidRefreshTokenException if token is already revoked', async () => {
      const mockTokenEntity = {
        data: {
          id: 'token-uuid-123',
          userId: 'user-id-123',
          token: 'existing-refresh-token-123',
          revokedAt: new Date(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
        revoke: jest.fn(),
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockTokenEntity);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidRefreshTokenException,
      );

      expect(mockTokenEntity.revoke).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
    });

    it('should throw InvalidRefreshTokenException if token is expired', async () => {
      const mockTokenEntity = {
        data: {
          id: 'token-uuid-123',
          userId: 'user-id-123',
          token: 'existing-refresh-token-123',
          revokedAt: undefined,
          expiresAt: new Date(Date.now() - 1000 * 60), // 1 minute in past
        },
        revoke: jest.fn(),
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockTokenEntity);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidRefreshTokenException,
      );

      expect(mockTokenEntity.revoke).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
    });
  });
});
