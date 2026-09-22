import { PasswordResetToken, ProviderVo } from '@core/domain';

import type { ForgotPasswordDto } from './forgot-password.dto';
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import { TokenNotGeneratedException } from '../../exceptions';

const mockPasswordResetTokenRepository = {
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
    PasswordResetToken: jest.fn().mockImplementation((props) => ({
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

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let defaultDto: ForgotPasswordDto;
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
        providers: new Set([ProviderVo.EMAIL]),
      },
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockProfileRepository.findByUserId.mockResolvedValue({
      data: { firstName: 'John', language: 'en' },
    });
    mockPasswordResetTokenRepository.verifyIfExistsByToken.mockResolvedValue(
      false,
    );
    mockPasswordResetTokenRepository.create.mockResolvedValue(undefined);

    useCase = new ForgotPasswordUseCase(
      mockPasswordResetTokenRepository as any,
      mockUserRepository as any,
      mockProfileRepository as any,
      mockNotificationQueue as any,
    );

    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('execute', () => {
    it('should generate password reset token and enqueue reset email successfully', async () => {
      await useCase.execute(defaultDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );
      expect(PasswordResetToken).toHaveBeenCalledWith({
        userId: mockUser.data.id,
      });
      expect(
        mockPasswordResetTokenRepository.verifyIfExistsByToken,
      ).toHaveBeenCalledWith('generated-token-123');
      expect(mockPasswordResetTokenRepository.create).toHaveBeenCalled();

      expect(
        mockNotificationQueue.enqueuePasswordResetEmail,
      ).toHaveBeenCalledWith({
        to: defaultDto.email,
        name: 'John',
        token: 'generated-token-123',
        language: 'en',
      });
    });

    it('should NOT throw error and do nothing when user does not exist (prevent enumeration)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(defaultDto)).resolves.not.toThrow();

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );
      expect(PasswordResetToken).not.toHaveBeenCalled();
      expect(mockPasswordResetTokenRepository.create).not.toHaveBeenCalled();
      expect(
        mockNotificationQueue.enqueuePasswordResetEmail,
      ).not.toHaveBeenCalled();
    });

    it('should NOT throw error and do nothing when user exists but lacks email provider (prevent enumeration)', async () => {
      mockUser.data.providers = new Set([ProviderVo.GOOGLE]);

      await expect(useCase.execute(defaultDto)).resolves.not.toThrow();

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );
      expect(PasswordResetToken).not.toHaveBeenCalled();
      expect(mockPasswordResetTokenRepository.create).not.toHaveBeenCalled();
      expect(
        mockNotificationQueue.enqueuePasswordResetEmail,
      ).not.toHaveBeenCalled();
    });

    it('should throw TokenNotGeneratedException when token generation fails after max attempts', async () => {
      mockPasswordResetTokenRepository.verifyIfExistsByToken.mockResolvedValue(
        true,
      );

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        TokenNotGeneratedException,
      );

      expect(PasswordResetToken).toHaveBeenCalledTimes(5);
      expect(
        mockPasswordResetTokenRepository.verifyIfExistsByToken,
      ).toHaveBeenCalledTimes(5);
      expect(mockPasswordResetTokenRepository.create).not.toHaveBeenCalled();
    });
  });
});
