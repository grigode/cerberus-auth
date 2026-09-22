import type { CreateSessionDto } from './create-session.dto';
import { CreateSessionUseCase } from './create-session.use-case';
import { RefreshToken, type User } from '@core/domain';

const mockRefreshTokenRepository = {
  create: jest.fn(),
};

const mockAccessTokenService = {
  generateAccessToken: jest.fn(),
};

jest.mock('@core/domain', () => ({
  ...jest.requireActual('@core/domain'),
  RefreshToken: jest.fn().mockImplementation((props) => ({
    data: {
      userId: props.userId,
      token: 'generated-refresh-token-123',
    },
  })),
}));

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;
  let mockUser: any;
  let defaultDto: CreateSessionDto;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      data: {
        id: 'user-id-123',
      },
    };

    defaultDto = {
      user: mockUser as User,
    };

    mockRefreshTokenRepository.create.mockResolvedValue(undefined);
    mockAccessTokenService.generateAccessToken.mockResolvedValue(
      'generated-access-token-123',
    );

    useCase = new CreateSessionUseCase(
      mockRefreshTokenRepository as any,
      mockAccessTokenService as any,
    );
  });

  describe('execute', () => {
    it('should create a session successfully', async () => {
      const result = await useCase.execute(defaultDto);

      expect(mockAccessTokenService.generateAccessToken).toHaveBeenCalledWith(
        'user-id-123',
      );

      expect(RefreshToken).toHaveBeenCalledWith({
        userId: 'user-id-123',
      });

      expect(mockRefreshTokenRepository.create).toHaveBeenCalled();

      expect(result).toEqual({
        accessToken: 'generated-access-token-123',
        refreshToken: 'generated-refresh-token-123',
      });
    });

    it('should handle when access token generation fails', async () => {
      const error = new Error('Access token generation failed');
      mockAccessTokenService.generateAccessToken.mockRejectedValue(error);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(error);

      expect(RefreshToken).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.create).not.toHaveBeenCalled();
    });

    it('should handle when refresh token creation fails', async () => {
      const error = new Error('Refresh token creation failed');
      mockRefreshTokenRepository.create.mockRejectedValue(error);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(error);

      expect(mockAccessTokenService.generateAccessToken).toHaveBeenCalledWith(
        'user-id-123',
      );
      expect(RefreshToken).toHaveBeenCalledWith({ userId: 'user-id-123' });
    });
  });
});
