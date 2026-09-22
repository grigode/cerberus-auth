import { ConfirmationToken } from '@core/domain';

import type { ResendConfirmEmailDto } from './resend-confirm-email.dto';
import { ResendConfirmationEmailUseCase } from './resend-confirm-email.use-case';
import {
  TokenNotGeneratedException,
  UserAlreadyConfirmedException,
  UserNotFoundException,
} from '../../exceptions';

const mockConfirmationTokenRepository = {
  verifyIfExistsByToken: jest.fn(),
  create: jest.fn(),
};

const mockUserRepository = {
  findByEmail: jest.fn(),
};

const mockProfileRepository = {
  findByUserId: jest.fn(),
  create: jest.fn(),
};

const mockNotificationQueue = {
  enqueueVerificationEmail: jest.fn().mockResolvedValue(undefined),
  enqueuePasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@core/domain', () => {
  const actual = jest.requireActual('@core/domain');
  return {
    ...actual,
    ConfirmationToken: jest.fn().mockImplementation((props) => ({
      data: {
        id: 'token-id-123',
        userId: props.userId,
        token: 'generated-token-123',
        createdAt: new Date(),
        expiresAt: new Date(),
      },
    })),
  };
});

describe('ResendConfirmationEmailUseCase', () => {
  let useCase: ResendConfirmationEmailUseCase;
  let defaultDto: ResendConfirmEmailDto;
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultDto = {
      email: 'user@example.com',
    };

    mockUser = {
      data: {
        id: 'user-id-123',
        email: 'user@example.com',
        isEmailVerified: false,
      },
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockProfileRepository.findByUserId.mockResolvedValue({
      data: { firstName: 'Jane', language: 'en' },
    });
    mockConfirmationTokenRepository.verifyIfExistsByToken.mockResolvedValue(
      false,
    );
    mockConfirmationTokenRepository.create.mockResolvedValue(undefined);

    useCase = new ResendConfirmationEmailUseCase(
      mockConfirmationTokenRepository as any,
      mockUserRepository as any,
      mockProfileRepository as any,
      mockNotificationQueue as any,
    );

    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('execute', () => {
    it('should resend confirmation email successfully', async () => {
      await useCase.execute(defaultDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );
      expect(ConfirmationToken).toHaveBeenCalledWith({
        userId: mockUser.data.id,
      });
      expect(
        mockConfirmationTokenRepository.verifyIfExistsByToken,
      ).toHaveBeenCalledWith('generated-token-123');
      expect(mockConfirmationTokenRepository.create).toHaveBeenCalled();

      expect(
        mockNotificationQueue.enqueueVerificationEmail,
      ).toHaveBeenCalledWith({
        to: defaultDto.email,
        name: 'Jane',
        token: 'generated-token-123',
        language: 'en',
      });
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        UserNotFoundException,
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );
      expect(ConfirmationToken).not.toHaveBeenCalled();
      expect(
        mockConfirmationTokenRepository.verifyIfExistsByToken,
      ).not.toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.create).not.toHaveBeenCalled();
      expect(
        mockNotificationQueue.enqueueVerificationEmail,
      ).not.toHaveBeenCalled();
    });

    it('should throw UserAlreadyConfirmedException when user is already verified', async () => {
      mockUser.data.isEmailVerified = true;

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        UserAlreadyConfirmedException,
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );
      expect(ConfirmationToken).not.toHaveBeenCalled();
      expect(
        mockConfirmationTokenRepository.verifyIfExistsByToken,
      ).not.toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.create).not.toHaveBeenCalled();
      expect(
        mockNotificationQueue.enqueueVerificationEmail,
      ).not.toHaveBeenCalled();
    });

    it('should throw TokenNotGeneratedException when token generation fails after max attempts', async () => {
      mockConfirmationTokenRepository.verifyIfExistsByToken.mockResolvedValue(
        true,
      );

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        TokenNotGeneratedException,
      );

      expect(ConfirmationToken).toHaveBeenCalledTimes(5);
      expect(
        mockConfirmationTokenRepository.verifyIfExistsByToken,
      ).toHaveBeenCalledTimes(5);
      expect(mockConfirmationTokenRepository.create).not.toHaveBeenCalled();
    });

    it('should handle token generation succeeding on subsequent attempt', async () => {
      mockConfirmationTokenRepository.verifyIfExistsByToken
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await useCase.execute(defaultDto);

      expect(ConfirmationToken).toHaveBeenCalledTimes(2);
      expect(
        mockConfirmationTokenRepository.verifyIfExistsByToken,
      ).toHaveBeenCalledTimes(2);
    });
  });
});
