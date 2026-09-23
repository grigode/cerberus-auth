import type { ResetPasswordDto } from './reset-password.dto';
import { ResetPasswordUseCase } from './reset-password.use-case';
import {
  InvalidResetTokenException,
  UserInactiveException,
} from '../../exceptions';

const mockPasswordResetTokenRepository = {
  findByToken: jest.fn(),
  update: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockRefreshTokenRepository = {
  revokeAllByUserId: jest.fn(),
};

const mockHashingPort = {
  hash: jest.fn().mockResolvedValue('hashed-new-password'),
  compare: jest.fn().mockResolvedValue(true),
};

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let defaultDto: ResetPasswordDto;
  let mockToken: any;
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultDto = {
      token: 'valid-token-123',
      password: 'NewStrongPassword123!',
    };

    mockToken = {
      data: {
        id: 'token-id-123',
        userId: 'user-id-123',
        token: 'valid-token-123',
      },
      isValid: jest.fn().mockReturnValue(true),
      markAsUsed: jest.fn(),
    };

    mockUser = {
      data: {
        id: 'user-id-123',
        email: 'user@example.com',
        isActive: true,
      },
      updatePassword: jest.fn().mockResolvedValue(undefined),
    };

    mockPasswordResetTokenRepository.findByToken.mockResolvedValue(mockToken);
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(undefined);
    mockPasswordResetTokenRepository.update.mockResolvedValue(undefined);
    mockRefreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

    useCase = new ResetPasswordUseCase(
      mockPasswordResetTokenRepository as any,
      mockUserRepository as any,
      mockRefreshTokenRepository as any,
      mockHashingPort as any,
    );
  });

  describe('execute', () => {
    it('should reset password successfully when token is valid and user is active', async () => {
      await useCase.execute(defaultDto);

      expect(mockPasswordResetTokenRepository.findByToken).toHaveBeenCalledWith(
        defaultDto.token,
      );
      expect(mockToken.isValid).toHaveBeenCalled();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id-123');
      expect(mockHashingPort.hash).toHaveBeenCalledWith(defaultDto.password);
      expect(mockUser.updatePassword).toHaveBeenCalledWith(
        'hashed-new-password',
      );
      expect(mockToken.markAsUsed).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
      expect(mockPasswordResetTokenRepository.update).toHaveBeenCalledWith(
        mockToken,
      );
      expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
        'user-id-123',
      );
    });

    it('should throw InvalidResetTokenException if token is missing', async () => {
      defaultDto.token = '';

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidResetTokenException,
      );

      expect(
        mockPasswordResetTokenRepository.findByToken,
      ).not.toHaveBeenCalled();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw InvalidResetTokenException if token is not found', async () => {
      mockPasswordResetTokenRepository.findByToken.mockResolvedValue(null);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidResetTokenException,
      );

      expect(mockPasswordResetTokenRepository.findByToken).toHaveBeenCalledWith(
        defaultDto.token,
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw InvalidResetTokenException if token is invalid (expired/used)', async () => {
      mockToken.isValid.mockReturnValue(false);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidResetTokenException,
      );

      expect(mockPasswordResetTokenRepository.findByToken).toHaveBeenCalledWith(
        defaultDto.token,
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw InvalidResetTokenException if user associated with token is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidResetTokenException,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id-123');
      expect(mockUser.updatePassword).not.toHaveBeenCalled();
    });

    it('should throw UserInactiveException if user associated with token is inactive', async () => {
      mockUser.data.isActive = false;

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        UserInactiveException,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id-123');
      expect(mockUser.updatePassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockPasswordResetTokenRepository.update).not.toHaveBeenCalled();
    });
  });
});
