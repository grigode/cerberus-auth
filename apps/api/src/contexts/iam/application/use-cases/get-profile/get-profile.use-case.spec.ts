import { LanguageCode } from '@core/domain';

import { GetProfileUseCase } from './get-profile.use-case';
import { Profile, ProviderVo, RoleVo, User } from '@core/domain';
import {
  ProfileNotFoundException,
  UserNotFoundException,
} from '../../exceptions';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let mockUserRepository: any;
  let mockProfileRepository: any;

  const mockUser = new User({
    id: 'user-uuid-123',
    email: 'test@example.com',
    providers: new Set([ProviderVo.EMAIL]),
    role: RoleVo.USER,
    isActive: true,
    isEmailVerified: true,
  });

  const mockProfile = new Profile({
    userId: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  });

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
    };
    mockProfileRepository = {
      findByUserId: jest.fn(),
    };
    useCase = new GetProfileUseCase(mockUserRepository, mockProfileRepository);
  });

  it('should return user and profile data when found', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockProfileRepository.findByUserId.mockResolvedValue(mockProfile);

    const result = await useCase.execute({ userId: 'user-uuid-123' });

    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-uuid-123');
    expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(
      'user-uuid-123',
    );
    expect(result).toEqual({
      id: 'user-uuid-123',
      email: 'test@example.com',
      role: RoleVo.USER,
      isActive: true,
      isEmailVerified: true,
      isMfaEnabled: false,
      createdAt: expect.any(Date),
      updatedAt: undefined,
      lastLoginAt: undefined,
      providers: [ProviderVo.EMAIL],
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        language: LanguageCode.EN,
      },
    });
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'non-existent-user' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw ProfileNotFoundException if profile does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'user-uuid-123' })).rejects.toThrow(
      ProfileNotFoundException,
    );
  });
});
