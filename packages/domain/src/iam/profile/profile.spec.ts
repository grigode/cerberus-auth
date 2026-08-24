import { Profile, type ProfileProps } from './profile.entity';

describe('Profile', () => {
  let defaultProps: ProfileProps;

  beforeEach(() => {
    defaultProps = {
      userId: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    };
  });

  it('should create a profile with all props', () => {
    const profile = new Profile(defaultProps);
    const data = profile.data;

    expect(data.userId).toBe(defaultProps.userId);
    expect(data.firstName).toBe(defaultProps.firstName);
    expect(data.lastName).toBe(defaultProps.lastName);
    expect(data.avatarUrl).toBe(defaultProps.avatarUrl);
  });

  it('should create profile without avatarUrl', () => {
    const { avatarUrl: _avatarUrl, ...propsWithoutAvatar } = defaultProps;
    const profile = new Profile(propsWithoutAvatar);

    expect(profile.data.avatarUrl).toBeUndefined();
  });

  it('should not allow modifying firstName and lastName directly', () => {
    const profile = new Profile(defaultProps);

    (profile as unknown as Record<string, string>).firstName = 'Jane';
    (profile as unknown as Record<string, string>).lastName = 'Smith';

    expect(profile.data.firstName).toBe('John');
    expect(profile.data.lastName).toBe('Doe');
  });

  it('should update profile fields using update method', () => {
    const profile = new Profile(defaultProps);

    profile.update({
      firstName: 'Jane',
      lastName: 'Smith',
      avatarUrl: 'https://example.com/new-avatar.jpg',
    });

    expect(profile.data.firstName).toBe('Jane');
    expect(profile.data.lastName).toBe('Smith');
    expect(profile.data.avatarUrl).toBe('https://example.com/new-avatar.jpg');
  });
});
