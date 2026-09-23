import { LanguageCode } from '@core/domain';

import type { CreateUserDto } from './create-user.dto';
import { CreateUserUseCase } from './create-user.use-case';
import {
  ConfirmationToken,
  Profile,
  ProviderVo,
  RoleVo,
  User,
} from '@core/domain';
import {
  PasswordIsRequiredException,
  UserAlreadyExistsException,
  TokenNotGeneratedException,
} from '../../exceptions';

const mockUserRepository = {
  verifyIfExistsByEmail: jest.fn(),
  create: jest.fn(),
};

const mockProfileRepository = {
  create: jest.fn(),
};

const mockConfirmationTokenRepository = {
  verifyIfExistsByToken: jest.fn(),
  create: jest.fn(),
};

const mockNotificationQueue = {
  enqueueVerificationEmail: jest.fn().mockResolvedValue(undefined),
  enqueuePasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

const mockHashingPort = {
  hash: jest.fn().mockResolvedValue('hashed-password-123'),
  compare: jest.fn().mockResolvedValue(true),
};

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-token-123'),
}));
jest.mock('date-fns', () => ({
  addHours: jest.fn((date: Date, hours: number) => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }),
}));
jest.mock('@core/domain', () => {
  const actual = jest.requireActual('@core/domain');
  return {
    ...actual,
    DomainException: class DomainException extends Error {},
    generateUuid: jest.fn(() => 'generated-uuid-123'),
  };
});
jest.mock('@core/domain', () => ({
  ...jest.requireActual('@core/domain'),
  User: jest.fn().mockImplementation((props) => ({
    data: {
      id: 'user-id-123',
      email: props.email,
      providers: props.providers,
      role: props.role,
      isEmailVerified: props.isEmailVerified,
    },
    updatePassword: jest.fn().mockResolvedValue(undefined),
  })),
  Profile: jest.fn().mockImplementation((props) => ({
    data: {
      userId: props.userId,
      firstName: props.firstName,
      lastName: props.lastName,
      language: props.language ?? 'EN',
    },
  })),
  ConfirmationToken: jest.fn().mockImplementation((props) => ({
    data: {
      id: 'token-id-123',
      userId: props.userId,
      token: 'generated-token-123',
      createdAt: new Date(),
      expiresAt: new Date(),
    },
  })),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let defaultDto: CreateUserDto;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      provider: ProviderVo.EMAIL,
    };

    mockUserRepository.verifyIfExistsByEmail.mockResolvedValue(false);
    mockUserRepository.create.mockResolvedValue(undefined);
    mockProfileRepository.create.mockResolvedValue(undefined);
    mockConfirmationTokenRepository.verifyIfExistsByToken.mockResolvedValue(
      false,
    );
    mockConfirmationTokenRepository.create.mockResolvedValue(undefined);

    useCase = new CreateUserUseCase(
      mockConfirmationTokenRepository as any,
      mockProfileRepository as any,
      mockUserRepository as any,
      mockNotificationQueue as any,
      mockHashingPort as any,
    );

    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('execute', () => {
    it('should create a user successfully with email provider', async () => {
      await useCase.execute(defaultDto);

      expect(mockUserRepository.verifyIfExistsByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );

      expect(User).toHaveBeenCalledWith({
        email: defaultDto.email,
        providers: new Set([ProviderVo.EMAIL]),
        role: RoleVo.USER,
        isEmailVerified: false,
      });

      const mockUserInstance = (User as jest.Mock).mock.results[0]?.value;
      expect(mockHashingPort.hash).toHaveBeenCalledWith(defaultDto.password);
      expect(mockUserInstance?.updatePassword).toHaveBeenCalledWith(
        'hashed-password-123',
      );

      expect(Profile).toHaveBeenCalledWith({
        userId: 'user-id-123',
        firstName: defaultDto.firstName,
        lastName: defaultDto.lastName,
        language: LanguageCode.EN,
      });

      expect(ConfirmationToken).toHaveBeenCalledWith({
        userId: 'user-id-123',
      });

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockProfileRepository.create).toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.create).toHaveBeenCalled();
    });

    it('should create a user successfully with Google provider (no password required)', async () => {
      const googleDto = {
        ...defaultDto,
        provider: ProviderVo.GOOGLE,
        password: undefined,
      };

      await useCase.execute(googleDto);

      expect(User).toHaveBeenCalledWith({
        email: googleDto.email,
        providers: new Set([ProviderVo.GOOGLE]),
        role: RoleVo.USER,
        isEmailVerified: true,
      });

      const mockUserInstance = (User as jest.Mock).mock.results[0]?.value;
      expect(mockUserInstance?.updatePassword).not.toHaveBeenCalled();

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockProfileRepository.create).toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.create).toHaveBeenCalled();
    });

    it('should throw PasswordIsRequiredException when provider is email and no password', async () => {
      const dtoWithoutPassword = {
        ...defaultDto,
        password: undefined,
        provider: ProviderVo.EMAIL,
      };

      await expect(useCase.execute(dtoWithoutPassword)).rejects.toThrow(
        PasswordIsRequiredException,
      );

      expect(mockUserRepository.verifyIfExistsByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw UserAlreadyExistsException when email is already registered', async () => {
      mockUserRepository.verifyIfExistsByEmail.mockResolvedValue(true);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockProfileRepository.create).not.toHaveBeenCalled();
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

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should handle token generation succeeding on second attempt', async () => {
      mockConfirmationTokenRepository.verifyIfExistsByToken
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await useCase.execute(defaultDto);

      expect(ConfirmationToken).toHaveBeenCalledTimes(2);
      expect(
        mockConfirmationTokenRepository.verifyIfExistsByToken,
      ).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create user BEFORE profile and confirmation token', async () => {
      const createOrder: string[] = [];

      mockUserRepository.create.mockImplementation(async () => {
        createOrder.push('user');
        await Promise.resolve();
      });

      mockProfileRepository.create.mockImplementation(async () => {
        createOrder.push('profile');
        await Promise.resolve();
      });

      mockConfirmationTokenRepository.create.mockImplementation(async () => {
        createOrder.push('token');
        await Promise.resolve();
      });

      await useCase.execute(defaultDto);

      expect(createOrder[0]).toBe('user');

      expect(createOrder.indexOf('profile')).toBeGreaterThan(
        createOrder.indexOf('user'),
      );
      expect(createOrder.indexOf('token')).toBeGreaterThan(
        createOrder.indexOf('user'),
      );
    });

    it('should handle race condition when token exists on first attempt', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockConfirmationTokenRepository.verifyIfExistsByToken
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await useCase.execute(defaultDto);

      expect(ConfirmationToken).toHaveBeenCalledTimes(2);
      expect(mockNotificationQueue.enqueueVerificationEmail).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });

  describe('_generateConfirmationToken', () => {
    it('should generate a unique token on first attempt', async () => {
      const userId = 'test-user-id';
      mockConfirmationTokenRepository.verifyIfExistsByToken.mockResolvedValue(
        false,
      );

      const token = await useCase._generateConfirmationToken(userId);

      expect(ConfirmationToken).toHaveBeenCalledWith({ userId });
      expect(token.data.token).toBe('generated-token-123');
      expect(
        mockConfirmationTokenRepository.verifyIfExistsByToken,
      ).toHaveBeenCalledTimes(1);
    });

    it('should retry up to 5 times when tokens already exist', async () => {
      const userId = 'test-user-id';
      mockConfirmationTokenRepository.verifyIfExistsByToken
        .mockResolvedValue(true)
        .mockResolvedValue(true)
        .mockResolvedValue(true)
        .mockResolvedValue(true)
        .mockResolvedValue(true);

      await expect(useCase._generateConfirmationToken(userId)).rejects.toThrow(
        TokenNotGeneratedException,
      );

      expect(ConfirmationToken).toHaveBeenCalledTimes(5);
      expect(
        mockConfirmationTokenRepository.verifyIfExistsByToken,
      ).toHaveBeenCalledTimes(5);
    });

    it('should return token on successful attempt after retries', async () => {
      const userId = 'test-user-id';
      mockConfirmationTokenRepository.verifyIfExistsByToken
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const token = await useCase._generateConfirmationToken(userId);

      expect(ConfirmationToken).toHaveBeenCalledTimes(3);
      expect(token.data.token).toBe('generated-token-123');
    });
  });

  describe('Edge cases', () => {
    it('should handle when profile creation fails (rollback scenario)', async () => {
      const profileError = new Error('Profile creation failed');
      mockProfileRepository.create.mockRejectedValue(profileError);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(profileError);

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockConfirmationTokenRepository.create).toHaveBeenCalled();
    });

    it('should handle when token creation fails but user and profile succeed', async () => {
      const tokenError = new Error('Token creation failed');
      mockConfirmationTokenRepository.create.mockRejectedValue(tokenError);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(tokenError);

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockProfileRepository.create).toHaveBeenCalled();
    });

    it('should work with minimal user data (firstName, lastName, email)', async () => {
      const minimalDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        provider: ProviderVo.GOOGLE,
      };

      await useCase.execute(minimalDto);

      expect(User).toHaveBeenCalledWith({
        email: minimalDto.email,
        providers: new Set([ProviderVo.GOOGLE]),
        role: RoleVo.USER,
        isEmailVerified: true,
      });
    });
  });
});
