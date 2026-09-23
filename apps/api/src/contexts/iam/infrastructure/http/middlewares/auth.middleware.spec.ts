import { Test, type TestingModule } from '@nestjs/testing';
import {
  USER_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
  User,
  RoleVo,
  ProviderVo,
} from '@core/domain';
import {
  ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
  type AccessTokenDrivenPort,
  type UuidVo,
} from '@core/domain';

import { AuthMiddleware } from './auth.middleware';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let accessTokenPort: jest.Mocked<AccessTokenDrivenPort>;
  let userDrivenPort: jest.Mocked<UserDrivenPort>;

  const mockUserId: UuidVo = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    const mockAccessTokenPort: Partial<jest.Mocked<AccessTokenDrivenPort>> = {
      validateAccessToken: jest.fn(),
      generateAccessToken: jest.fn(),
      decodeToken: jest.fn(),
    };

    const mockUserDrivenPort: Partial<jest.Mocked<UserDrivenPort>> = {
      findById: jest.fn(),
      verifyIfExistsByEmail: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
        {
          provide: ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
          useValue: mockAccessTokenPort,
        },
        {
          provide: USER_DRIVEN_PORT_TOKEN,
          useValue: mockUserDrivenPort,
        },
      ],
    }).compile();

    middleware = module.get<AuthMiddleware>(AuthMiddleware);
    accessTokenPort = module.get(ACCESS_TOKEN_DRIVEN_PORT_TOKEN);
    userDrivenPort = module.get(USER_DRIVEN_PORT_TOKEN);
  });

  const createMockUser = (isActive = true) => {
    return new User({
      id: mockUserId,
      email: 'test@example.com',
      role: RoleVo.USER,
      providers: new Set([ProviderVo.EMAIL]),
      isActive,
      isEmailVerified: true,
    });
  };

  it('should inject user into request when valid Bearer token is provided', async () => {
    const mockUser = createMockUser(true);
    accessTokenPort.validateAccessToken.mockResolvedValue({
      sub: mockUserId.toString(),
    });
    userDrivenPort.findById.mockResolvedValue(mockUser);

    const req: any = {
      headers: {
        authorization: 'Bearer valid.jwt.token',
      },
    };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(accessTokenPort.validateAccessToken).toHaveBeenCalledWith(
      'valid.jwt.token',
    );
    expect(userDrivenPort.findById).toHaveBeenCalledWith(mockUserId);
    expect(req.user).toEqual({
      id: mockUserId.toString(),
      email: 'test@example.com',
      role: RoleVo.USER,
      isActive: true,
      isEmailVerified: true,
    });
    expect(next).toHaveBeenCalled();
  });

  it('should inject user when valid token is in access_token cookie', async () => {
    const mockUser = createMockUser(true);
    accessTokenPort.validateAccessToken.mockResolvedValue({
      sub: mockUserId.toString(),
    });
    userDrivenPort.findById.mockResolvedValue(mockUser);

    const req: any = {
      headers: {},
      cookies: {
        access_token: 'cookie.jwt.token',
      },
    };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(accessTokenPort.validateAccessToken).toHaveBeenCalledWith(
      'cookie.jwt.token',
    );
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it('should not inject user if token is invalid or expired', async () => {
    accessTokenPort.validateAccessToken.mockRejectedValue(
      new Error('Token expired'),
    );

    const req: any = {
      headers: {
        authorization: 'Bearer invalid.token',
      },
    };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should not inject user if user does not exist', async () => {
    accessTokenPort.validateAccessToken.mockResolvedValue({
      sub: mockUserId.toString(),
    });
    userDrivenPort.findById.mockResolvedValue(null);

    const req: any = {
      headers: {
        authorization: 'Bearer valid.token',
      },
    };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should not inject user if user is inactive', async () => {
    const inactiveUser = createMockUser(false);
    accessTokenPort.validateAccessToken.mockResolvedValue({
      sub: mockUserId.toString(),
    });
    userDrivenPort.findById.mockResolvedValue(inactiveUser);

    const req: any = {
      headers: {
        authorization: 'Bearer valid.token',
      },
    };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should not inject user if token has mfaPending flag set', async () => {
    accessTokenPort.validateAccessToken.mockResolvedValue({
      sub: mockUserId.toString(),
      mfaPending: true,
    });

    const req: any = {
      headers: {
        authorization: 'Bearer mfa.challenge.token',
      },
    };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(req.user).toBeUndefined();
    expect(userDrivenPort.findById).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should call next without error if no token is provided', async () => {
    const req: any = {
      headers: {},
      cookies: {},
    };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
