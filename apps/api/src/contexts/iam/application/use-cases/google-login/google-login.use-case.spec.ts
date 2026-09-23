import type { GoogleLoginDto } from './google-login.dto';
import { GoogleLoginUseCase } from './google-login.use-case';
import { ProviderVo, RoleVo, User, Profile } from '@core/domain';
import { UserInactiveException } from '../../exceptions';

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockProfileRepository = {
  create: jest.fn(),
};

const mockCreateSessionUseCase = {
  execute: jest.fn(),
};

const mockAccessTokenService = {
  generateAccessToken: jest.fn(),
  validateAccessToken: jest.fn(),
  decodeToken: jest.fn(),
};

// We mock the User entity behavior. We need to track which methods are called.
const _mockUserInstance = {
  data: {
    id: 'user-id-123',
    email: 'john.doe@example.com',
    providers: new Set([ProviderVo.EMAIL]),
    role: RoleVo.USER,
    isEmailVerified: false,
    isActive: true,
  },
  addProvider: jest.fn(),
  verifyEmail: jest.fn(),
  updateLastLoginAt: jest.fn(),
};

jest.mock('@core/domain', () => {
  const actual = jest.requireActual('@core/domain');
  return {
    ...actual,
    User: jest.fn().mockImplementation((props) => {
      const providers = props.providers ?? new Set();
      const isActive = props.isActive ?? true;
      const isEmailVerified = props.isEmailVerified ?? false;
      let changed = false;
      return {
        data: {
          id: props.id ?? 'user-id-123',
          email: props.email,
          providers,
          role: props.role ?? RoleVo.USER,
          isEmailVerified,
          isActive,
        },
        addProvider: jest.fn(function (this: any, p) {
          providers.add(p);
          this.data.providers = providers;
          changed = true;
        }),
        verifyEmail: jest.fn(function (this: any) {
          this.data.isEmailVerified = true;
          changed = true;
        }),
        updateLastLoginAt: jest.fn(),
        hasChanges: jest.fn(() => changed),
      };
    }),
    Profile: jest.fn().mockImplementation((props) => ({
      data: {
        userId: props.userId,
        firstName: props.firstName,
        lastName: props.lastName,
      },
    })),
  };
});

describe('GoogleLoginUseCase', () => {
  let useCase: GoogleLoginUseCase;
  let defaultDto: GoogleLoginDto;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(undefined);
    mockUserRepository.update.mockResolvedValue(undefined);
    mockProfileRepository.create.mockResolvedValue(undefined);
    mockCreateSessionUseCase.execute.mockResolvedValue({
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
    });
    mockAccessTokenService.generateAccessToken.mockResolvedValue(
      'mfa-challenge-token',
    );

    useCase = new GoogleLoginUseCase(
      mockUserRepository as any,
      mockProfileRepository as any,
      mockCreateSessionUseCase as any,
      mockAccessTokenService as any,
    );
  });

  describe('execute', () => {
    it('should create a new user and profile if they do not exist', async () => {
      const result = await useCase.execute(defaultDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );

      // Verify User constructor was called with correct props
      expect(User).toHaveBeenCalledWith({
        email: defaultDto.email,
        providers: new Set([ProviderVo.GOOGLE]),
        role: RoleVo.USER,
        isEmailVerified: true,
      });

      // Verify Profile constructor was called with correct props
      expect(Profile).toHaveBeenCalledWith({
        userId: 'user-id-123',
        firstName: defaultDto.firstName,
        lastName: defaultDto.lastName,
      });

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockProfileRepository.create).toHaveBeenCalled();

      // Check update for lastLoginAt
      expect(mockUserRepository.update).toHaveBeenCalled();

      expect(mockCreateSessionUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      });
    });

    it('should throw UserInactiveException if user exists but is inactive', async () => {
      const inactiveUser = new User({
        email: defaultDto.email,
        providers: new Set([ProviderVo.EMAIL]),
        role: RoleVo.USER,
        isActive: false,
      });
      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        UserInactiveException,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockProfileRepository.create).not.toHaveBeenCalled();
    });

    it('should link the account if user exists and has email provider but not google provider', async () => {
      const existingUser = new User({
        email: defaultDto.email,
        providers: new Set([ProviderVo.EMAIL]),
        role: RoleVo.USER,
        isEmailVerified: false,
        isActive: true,
      });
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      const result = await useCase.execute(defaultDto);

      // Verify provider added
      expect(existingUser.data.providers.has(ProviderVo.GOOGLE)).toBe(true);
      expect(existingUser.data.providers.has(ProviderVo.EMAIL)).toBe(true);

      // Verify email was verified
      expect(existingUser.data.isEmailVerified).toBe(true);

      // Should call update to persist provider change, then update again for lastLoginAt (or combined)
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockProfileRepository.create).not.toHaveBeenCalled();

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      });
    });

    it('should not update providers if user exists and already has google provider', async () => {
      const existingGoogleUser = new User({
        email: defaultDto.email,
        providers: new Set([ProviderVo.GOOGLE]),
        role: RoleVo.USER,
        isEmailVerified: true,
        isActive: true,
      });
      mockUserRepository.findByEmail.mockResolvedValue(existingGoogleUser);

      const result = await useCase.execute(defaultDto);

      expect(existingGoogleUser.addProvider).not.toHaveBeenCalled();
      expect(existingGoogleUser.verifyEmail).not.toHaveBeenCalled();

      // Only updates lastLoginAt
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      });
    });

    it('should return mfaRequired and mfaToken if user has MFA enabled', async () => {
      const mfaUser = new User({
        email: defaultDto.email,
        providers: new Set([ProviderVo.GOOGLE]),
        role: RoleVo.USER,
        isEmailVerified: true,
        isActive: true,
      });
      (mfaUser.data as any).isMfaEnabled = true;
      mockUserRepository.findByEmail.mockResolvedValue(mfaUser);

      const result = await useCase.execute(defaultDto);

      expect(mockAccessTokenService.generateAccessToken).toHaveBeenCalledWith(
        mfaUser.data.id,
        { mfaPending: true },
      );
      expect(mockCreateSessionUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual({
        mfaRequired: true,
        mfaToken: 'mfa-challenge-token',
      });
    });
  });
});
