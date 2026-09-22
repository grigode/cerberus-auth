import type { ConfirmEmailDto } from './confirm-email.dto';
import { ConfirmEmailUseCase } from './confirm-email.use-case';
import {
  ConfirmationTokenNotFoundException,
  InvalidConfirmationTokenException,
  UserInactiveException,
  UserNotFoundException,
} from '../../exceptions';

const mockConfirmationTokenRepository = {
  findByToken: jest.fn(),
  update: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('ConfirmEmailUseCase', () => {
  let useCase: ConfirmEmailUseCase;
  let defaultDto: ConfirmEmailDto;
  let mockConfirmationToken: any;
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultDto = {
      token: 'valid-token-123',
    };

    mockConfirmationToken = {
      data: {
        userId: 'user-uuid-123',
      },
      isValid: jest.fn().mockReturnValue(true),
      markAsUsed: jest.fn(),
    };

    mockUser = {
      data: {
        email: 'user@example.com',
        isActive: true,
      },
      verifyEmail: jest.fn(),
    };

    mockConfirmationTokenRepository.findByToken.mockResolvedValue(
      mockConfirmationToken,
    );
    mockConfirmationTokenRepository.update.mockResolvedValue(undefined);
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(undefined);

    useCase = new ConfirmEmailUseCase(
      mockConfirmationTokenRepository as any,
      mockUserRepository as any,
    );
  });

  describe('execute', () => {
    it('should successfully confirm email', async () => {
      await useCase.execute(defaultDto);

      expect(mockConfirmationTokenRepository.findByToken).toHaveBeenCalledWith(
        defaultDto.token,
      );
      expect(mockConfirmationToken.isValid).toHaveBeenCalled();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        mockConfirmationToken.data.userId,
      );
      expect(mockConfirmationToken.markAsUsed).toHaveBeenCalled();
      expect(mockUser.verifyEmail).toHaveBeenCalled();

      expect(mockConfirmationTokenRepository.update).toHaveBeenCalledWith(
        mockConfirmationToken,
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConfirmationTokenNotFoundException when token does not exist', async () => {
      mockConfirmationTokenRepository.findByToken.mockResolvedValue(null);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        ConfirmationTokenNotFoundException,
      );

      expect(mockConfirmationTokenRepository.findByToken).toHaveBeenCalledWith(
        defaultDto.token,
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.update).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw InvalidConfirmationTokenException when token is invalid', async () => {
      mockConfirmationToken.isValid.mockReturnValue(false);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidConfirmationTokenException,
      );

      expect(mockConfirmationToken.isValid).toHaveBeenCalled();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockConfirmationToken.markAsUsed).not.toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.update).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        UserNotFoundException,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        mockConfirmationToken.data.userId,
      );
      expect(mockUser.verifyEmail).not.toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.update).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UserInactiveException when user is inactive', async () => {
      mockUser.data.isActive = false;

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        UserInactiveException,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        mockConfirmationToken.data.userId,
      );
      expect(mockUser.verifyEmail).not.toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.update).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});
