import argon2 from 'argon2';
import { DomainException, generateUuid } from '../../common';

import { User, type UserProps } from './user.entity';
import { ProviderVo } from './provider.vo';
import { RoleVo } from './role.vo';

jest.mock('argon2');
jest.mock('../../common', () => {
  const actual = jest.requireActual('../../common');
  return {
    ...actual,
    DomainException: class DomainException extends Error {},
    generateUuid: jest.fn(() => 'generated-uuid-123'),
  };
});

const mockArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe('User', () => {
  let defaultProps: UserProps;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultProps = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      hashedPassword: 'hashed-password-123',
      providers: new Set([ProviderVo.EMAIL]),
      role: RoleVo.USER,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      lastLoginAt: new Date('2024-01-01T00:00:00Z'),
    };

    mockArgon2.hash.mockResolvedValue('new-hashed-password');
  });

  describe('constructor', () => {
    it('should create a user with all props provided', () => {
      const user = new User(defaultProps);
      const data = user.data;

      expect(data.id).toBe(defaultProps.id);
      expect(data.email).toBe(defaultProps.email);
      expect(data.hashedPassword).toBe(defaultProps.hashedPassword);
      expect(data.providers).toEqual(defaultProps.providers);
      expect(data.role).toBe(defaultProps.role);
      expect(data.isActive).toBe(defaultProps.isActive);
      expect(data.isEmailVerified).toBe(defaultProps.isEmailVerified);
      expect(data.createdAt).toEqual(defaultProps.createdAt);
      expect(data.updatedAt).toEqual(defaultProps.updatedAt);
      expect(data.lastLoginAt).toEqual(defaultProps.lastLoginAt);
    });

    it('should generate an id if not provided', () => {
      const { id: _id, ...propsWithoutId } = defaultProps;
      const user = new User(propsWithoutId);

      expect(user.data.id).toBe('generated-uuid-123');
      expect(generateUuid).toHaveBeenCalled();
    });

    it('should set isActive to true by default', () => {
      const { isActive: _isActive, ...propsWithoutIsActive } = defaultProps;
      const user = new User(propsWithoutIsActive);

      expect(user.data.isActive).toBe(true);
    });

    it('should set isEmailVerified to false by default', () => {
      const {
        isEmailVerified: _isEmailVerified,
        ...propsWithoutEmailVerified
      } = defaultProps;
      const user = new User(propsWithoutEmailVerified);

      expect(user.data.isEmailVerified).toBe(false);
    });

    it('should set createdAt to current date if not provided', () => {
      const { createdAt: _createdAt, ...propsWithoutCreatedAt } = defaultProps;
      const beforeTest = new Date();
      const user = new User(propsWithoutCreatedAt);
      const afterTest = new Date();

      expect(user.data.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTest.getTime(),
      );
      expect(user.data.createdAt.getTime()).toBeLessThanOrEqual(
        afterTest.getTime(),
      );
    });

    it('should not set updatedAt if not provided', () => {
      const { updatedAt: _updatedAt, ...propsWithoutUpdatedAt } = defaultProps;
      const user = new User(propsWithoutUpdatedAt);

      expect(user.data.updatedAt).toBeUndefined();
    });
  });

  describe('updatePassword', () => {
    it('should hash and update password', async () => {
      const user = new User(defaultProps);
      const plainPassword = 'newPassword123';

      await user.updatePassword(plainPassword);

      expect(mockArgon2.hash).toHaveBeenCalledWith(plainPassword);
      expect(user.data.hashedPassword).toBe('new-hashed-password');
    });

    it('should update timestamp when password is updated', async () => {
      const user = new User(defaultProps);
      const originalUpdatedAt = user.data.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      await user.updatePassword('newPassword123');

      expect(user.data.updatedAt).toBeDefined();
      expect(user.data.updatedAt?.getTime()).toBeGreaterThan(
        (originalUpdatedAt as Date).getTime(),
      );
    });

    it('should update password even if user had no password before', async () => {
      const { hashedPassword: _hashedPassword, ...propsWithoutPassword } =
        defaultProps;
      const user = new User(propsWithoutPassword);

      await user.updatePassword('newPassword123');

      expect(user.data.hashedPassword).toBe('new-hashed-password');
      expect(user.data.updatedAt).toBeDefined();
    });
  });

  describe('addProvider', () => {
    it('should add a new provider to the set', () => {
      const user = new User(defaultProps);
      expect(user.data.providers.has(ProviderVo.GOOGLE)).toBe(false);

      user.addProvider(ProviderVo.GOOGLE);

      expect(user.data.providers.has(ProviderVo.GOOGLE)).toBe(true);
      expect(user.data.providers.size).toBe(2);
    });

    it('should not duplicate providers', () => {
      const user = new User(defaultProps);
      expect(user.data.providers.size).toBe(1);

      user.addProvider(ProviderVo.EMAIL);

      expect(user.data.providers.size).toBe(1);
    });

    it('should update timestamp when adding provider', () => {
      const user = new User(defaultProps);
      const originalUpdatedAt = user.data.updatedAt;

      user.addProvider(ProviderVo.GOOGLE);

      expect(user.data.updatedAt).toBeDefined();
      expect(user.data.updatedAt?.getTime()).toBeGreaterThan(
        (originalUpdatedAt as Date).getTime(),
      );
    });
  });

  describe('updateRole', () => {
    it('should update user role', () => {
      const user = new User(defaultProps);
      expect(user.data.role).toBe(RoleVo.USER);

      user.updateRole(RoleVo.ADMIN);

      expect(user.data.role).toBe(RoleVo.ADMIN);
    });

    it('should update timestamp when role is updated', () => {
      const user = new User(defaultProps);
      const originalUpdatedAt = user.data.updatedAt;

      user.updateRole(RoleVo.ADMIN);

      expect(user.data.updatedAt).toBeDefined();
      expect(user.data.updatedAt?.getTime()).toBeGreaterThan(
        (originalUpdatedAt as Date).getTime(),
      );
    });

    it('should throw DomainException when trying to set SUPERADMIN role', () => {
      const user = new User(defaultProps);

      expect(() => user.updateRole(RoleVo.SUPERADMIN)).toThrow(DomainException);
      expect(() => user.updateRole(RoleVo.SUPERADMIN)).toThrow(
        'There should only be one superuser',
      );
    });

    it('should throw DomainException when trying to change role of a superadmin user', () => {
      const superAdminProps = { ...defaultProps, role: RoleVo.SUPERADMIN };
      const superAdmin = new User(superAdminProps);

      expect(() => superAdmin.updateRole(RoleVo.ADMIN)).toThrow(
        DomainException,
      );
      expect(() => superAdmin.updateRole(RoleVo.ADMIN)).toThrow(
        'You cannot change the role of a superuser',
      );
    });
  });

  describe('toggleIsActive', () => {
    it('should change active status from true to false', () => {
      const user = new User(defaultProps);
      expect(user.data.isActive).toBe(true);

      user.toggleIsActive();

      expect(user.data.isActive).toBe(false);
    });

    it('should change active status from false to true', () => {
      const inactiveUser = new User({ ...defaultProps, isActive: false });
      expect(inactiveUser.data.isActive).toBe(false);

      inactiveUser.toggleIsActive();

      expect(inactiveUser.data.isActive).toBe(true);
    });

    it('should update timestamp when toggling active status', () => {
      const user = new User(defaultProps);
      const originalUpdatedAt = user.data.updatedAt;

      user.toggleIsActive();

      expect(user.data.updatedAt).toBeDefined();
      expect(user.data.updatedAt?.getTime()).toBeGreaterThan(
        (originalUpdatedAt as Date).getTime(),
      );
    });
  });

  describe('verifyEmail', () => {
    it('should set isEmailVerified to true', () => {
      const unverifiedUser = new User({
        ...defaultProps,
        isEmailVerified: false,
      });
      expect(unverifiedUser.data.isEmailVerified).toBe(false);

      unverifiedUser.verifyEmail();

      expect(unverifiedUser.data.isEmailVerified).toBe(true);
    });

    it('should update timestamp when verifying email', () => {
      const user = new User({ ...defaultProps, isEmailVerified: false });
      const originalUpdatedAt = user.data.updatedAt;

      user.verifyEmail();

      expect(user.data.updatedAt).toBeDefined();
      expect(user.data.updatedAt?.getTime()).toBeGreaterThan(
        (originalUpdatedAt as Date).getTime(),
      );
    });

    it('should keep isEmailVerified as true if already verified', () => {
      const user = new User(defaultProps);
      expect(user.data.isEmailVerified).toBe(true);

      user.verifyEmail();

      expect(user.data.isEmailVerified).toBe(true);
    });
  });

  describe('updateLastLoginAt', () => {
    it('should update lastLoginAt with current date if no date provided', () => {
      const user = new User(defaultProps);
      const beforeTest = new Date();

      user.updateLastLoginAt();

      const afterTest = new Date();
      expect((user.data.lastLoginAt as Date).getTime()).toBeGreaterThanOrEqual(
        beforeTest.getTime(),
      );
      expect((user.data.lastLoginAt as Date).getTime()).toBeLessThanOrEqual(
        afterTest.getTime(),
      );
    });

    it('should NOT update updatedAt timestamp', () => {
      const user = new User(defaultProps);
      const originalUpdatedAt = user.data.updatedAt;

      user.updateLastLoginAt();

      expect(user.data.updatedAt).toEqual(originalUpdatedAt);
    });
  });

  describe('data getter', () => {
    it('should return a copy of providers set (not the reference)', () => {
      const user = new User(defaultProps);
      const data = user.data;

      data.providers.clear();

      expect(user.data.providers.size).toBe(1);
      expect(user.data.providers.has(ProviderVo.EMAIL)).toBe(true);
    });

    it('should return all user data correctly', () => {
      const user = new User(defaultProps);
      const data = user.data;

      expect(data).toMatchObject({
        id: defaultProps.id,
        email: defaultProps.email,
        hashedPassword: defaultProps.hashedPassword,
        role: defaultProps.role,
        isActive: defaultProps.isActive,
        isEmailVerified: defaultProps.isEmailVerified,
        createdAt: defaultProps.createdAt,
        updatedAt: defaultProps.updatedAt,
        lastLoginAt: defaultProps.lastLoginAt,
      });
      expect(data.providers).toEqual(defaultProps.providers);
    });
  });

  describe('change tracking', () => {
    it('should not have changes initially', () => {
      const user = new User(defaultProps);
      expect(user.hasChanges()).toBe(false);
      expect(user.getChanges()).toEqual({});
    });

    it('should track changes when updating password', async () => {
      const user = new User(defaultProps);
      await user.updatePassword('newPassword123');
      expect(user.hasChanges()).toBe(true);
      expect(user.getChanges()).toHaveProperty(
        'hashedPassword',
        'new-hashed-password',
      );
      expect(user.getChanges()).toHaveProperty('updatedAt');
    });

    it('should track changes when adding a provider', () => {
      const user = new User(defaultProps);
      user.addProvider(ProviderVo.GOOGLE);
      expect(user.hasChanges()).toBe(true);
      expect(user.getChanges().providers).toContain(ProviderVo.GOOGLE);
      expect(user.getChanges()).toHaveProperty('updatedAt');
    });

    it('should track changes when updating role', () => {
      const user = new User(defaultProps);
      user.updateRole(RoleVo.ADMIN);
      expect(user.hasChanges()).toBe(true);
      expect(user.getChanges()).toHaveProperty('role', RoleVo.ADMIN);
      expect(user.getChanges()).toHaveProperty('updatedAt');
    });

    it('should track changes when toggling active status', () => {
      const user = new User(defaultProps);
      user.toggleIsActive();
      expect(user.hasChanges()).toBe(true);
      expect(user.getChanges()).toHaveProperty('isActive', false);
      expect(user.getChanges()).toHaveProperty('updatedAt');
    });

    it('should track changes when verifying email', () => {
      const unverifiedUser = new User({
        ...defaultProps,
        isEmailVerified: false,
      });
      unverifiedUser.verifyEmail();
      expect(unverifiedUser.hasChanges()).toBe(true);
      expect(unverifiedUser.getChanges()).toHaveProperty(
        'isEmailVerified',
        true,
      );
      expect(unverifiedUser.getChanges()).toHaveProperty('updatedAt');
    });

    it('should track changes when updating last login', () => {
      const user = new User(defaultProps);
      user.updateLastLoginAt();
      expect(user.hasChanges()).toBe(true);
      expect(user.getChanges()).toHaveProperty('lastLoginAt');
      expect(user.getChanges()).not.toHaveProperty('updatedAt');
    });

    it('should clear changes when committing', async () => {
      const user = new User(defaultProps);
      await user.updatePassword('newPassword123');
      expect(user.hasChanges()).toBe(true);

      user.commitChanges();

      expect(user.hasChanges()).toBe(false);
      expect(user.getChanges()).toEqual({});
    });
  });

  describe('Edge cases', () => {
    it('should handle user without any providers initially', () => {
      const propsWithoutProviders = {
        ...defaultProps,
        providers: new Set<ProviderVo>(),
      };
      const user = new User(propsWithoutProviders);

      expect(user.data.providers.size).toBe(0);

      user.addProvider(ProviderVo.GOOGLE);
      expect(user.data.providers.has(ProviderVo.GOOGLE)).toBe(true);
    });

    it('should handle user without lastLoginAt initially', () => {
      const { lastLoginAt: _lastLoginAt, ...propsWithoutLastLogin } =
        defaultProps;
      const user = new User(propsWithoutLastLogin);

      expect(user.data.lastLoginAt).toBeUndefined();

      user.updateLastLoginAt();
      expect(user.data.lastLoginAt).toBeDefined();
    });

    it('should handle concurrent operations correctly', async () => {
      const user = new User(defaultProps);

      await user.updatePassword('password1');
      user.addProvider(ProviderVo.GOOGLE);
      user.toggleIsActive();

      expect(user.data.hashedPassword).toBe('new-hashed-password');
      expect(user.data.providers.has(ProviderVo.GOOGLE)).toBe(true);
      expect(user.data.isActive).toBe(false);
      expect(user.data.updatedAt).toBeDefined();
    });
  });
});
