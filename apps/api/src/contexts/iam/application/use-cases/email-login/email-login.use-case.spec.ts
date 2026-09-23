import type { EmailLoginDto } from './email-login.dto';
import { EmailLoginUseCase } from './email-login.use-case';
import { ProviderVo } from '@core/domain';
import {
  EmailNotVerifiedException,
  InvalidCredentialsException,
  UserInactiveException,
} from '../../exceptions';

const mockUserRepository = {
  findByEmail: jest.fn(),
  update: jest.fn(),
};

const mockAccessTokenService = {
  generateAccessToken: jest.fn(),
};

const mockCreateSessionUseCase = {
  execute: jest.fn(),
};

const mockHashingPort = {
  hash: jest.fn(),
  compare: jest.fn(),
};

let mockUserInstance: any;

jest.mock('@core/domain', () => ({
  ...jest.requireActual('@core/domain'),
  User: jest.fn().mockImplementation(() => mockUserInstance),
}));

describe('EmailLoginUseCase', () => {
  let useCase: EmailLoginUseCase;
  let defaultDto: EmailLoginDto;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockUserInstance = {
      data: {
        id: 'user-id-123',
        email: 'test@example.com',
        providers: new Set([ProviderVo.EMAIL]),
        isActive: true,
        isEmailVerified: true,
        isMfaEnabled: false,
      },
      verifyPassword: jest.fn().mockResolvedValue(true),
      updateLastLoginAt: jest.fn(),
      isLockedOut: jest.fn().mockReturnValue(false),
      incrementFailedLogin: jest.fn(),
      resetFailedLogin: jest.fn(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUserInstance);
    mockUserRepository.update.mockResolvedValue(undefined);
    mockCreateSessionUseCase.execute.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    useCase = new EmailLoginUseCase(
      mockUserRepository as any,
      mockAccessTokenService as any,
      mockHashingPort as any,
      mockCreateSessionUseCase as any,
    );
  });

  describe('execute', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await useCase.execute(defaultDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        defaultDto.email,
      );
      expect(mockUserInstance.verifyPassword).toHaveBeenCalledWith(
        defaultDto.password,
        mockHashingPort,
      );
      expect(mockUserInstance.updateLastLoginAt).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUserInstance);
      expect(mockCreateSessionUseCase.execute).toHaveBeenCalledWith({
        user: mockUserInstance,
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should return mfaRequired and mfaToken when MFA is enabled', async () => {
      mockUserInstance.data.isMfaEnabled = true;
      mockAccessTokenService.generateAccessToken.mockResolvedValue(
        'temp-mfa-jwt',
      );

      const result = await useCase.execute(defaultDto);

      expect(result).toEqual({
        mfaRequired: true,
        mfaToken: 'temp-mfa-jwt',
      });
    });

    it('should throw InvalidCredentialsException when user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidCredentialsException,
      );

      expect(mockUserInstance.verifyPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockCreateSessionUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw UserInactiveException when user is inactive', async () => {
      mockUserInstance.data.isActive = false;

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        UserInactiveException,
      );

      expect(mockUserInstance.verifyPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw EmailNotVerifiedException when email is not verified', async () => {
      mockUserInstance.data.isEmailVerified = false;

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        EmailNotVerifiedException,
      );

      expect(mockUserInstance.verifyPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException when user does not have EMAIL provider', async () => {
      mockUserInstance.data.providers = new Set([ProviderVo.GOOGLE]);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidCredentialsException,
      );

      expect(mockUserInstance.verifyPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException when password verification fails', async () => {
      mockUserInstance.verifyPassword.mockResolvedValue(false);

      await expect(useCase.execute(defaultDto)).rejects.toThrow(
        InvalidCredentialsException,
      );

      expect(mockUserInstance.verifyPassword).toHaveBeenCalledWith(
        defaultDto.password,
        mockHashingPort,
      );
      expect(mockUserInstance.incrementFailedLogin).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUserInstance);
      expect(mockUserInstance.updateLastLoginAt).not.toHaveBeenCalled();
    });
  });
});
