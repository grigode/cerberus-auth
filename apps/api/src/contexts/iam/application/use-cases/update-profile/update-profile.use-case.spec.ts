import { LanguageCode } from '@core/domain';

import { UpdateProfileUseCase } from './update-profile.use-case';
import { Profile, ProviderVo, RoleVo, User } from '@core/domain';
import {
  ProfileNotFoundException,
  UserNotFoundException,
} from '../../exceptions';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
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
    language: LanguageCode.EN,
  });

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
    };
    mockProfileRepository = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdateProfileUseCase(
      mockUserRepository,
      mockProfileRepository,
    );
  });

  it('should update profile fields successfully', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockProfileRepository.findByUserId.mockResolvedValue(mockProfile);
    mockProfileRepository.update.mockImplementation(
      (profile: Profile) => profile,
    );

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      firstName: 'Jane',
      lastName: 'Smith',
      language: LanguageCode.ES,
    });

    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-uuid-123');
    expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(
      'user-uuid-123',
    );
    expect(mockProfileRepository.update).toHaveBeenCalled();
    expect(result.profile).toEqual({
      firstName: 'Jane',
      lastName: 'Smith',
      avatarUrl: 'https://example.com/avatar.jpg',
      language: LanguageCode.ES,
    });
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'non-existent-user', firstName: 'Jane' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw ProfileNotFoundException if profile does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'user-uuid-123', firstName: 'Jane' }),
    ).rejects.toThrow(ProfileNotFoundException);
  });
});
