import * as datefns from 'date-fns';
import { nanoid } from 'nanoid';
import type { UuidVo } from '../../common';

import {
  PasswordResetToken,
  type PasswordResetTokenProps,
} from './password-reset-token.entity';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-token-123'),
}));
jest.mock('date-fns', () => ({
  addHours: jest.fn((date: Date, hours: number) => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }),
  isAfter: jest.fn((date: Date, dateToCompare: Date) => {
    return date.getTime() > dateToCompare.getTime();
  }),
}));
jest.mock('../../common', () => {
  const actual = jest.requireActual('../../common');
  return {
    ...actual,
    generateUuid: jest.fn(() => 'generated-uuid-456'),
  };
});

const mockNanoid = nanoid as jest.MockedFunction<typeof nanoid>;
const mockDateFns = datefns as jest.Mocked<typeof datefns>;

describe('PasswordResetToken', () => {
  let defaultProps: PasswordResetTokenProps;
  let fixedDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();

    fixedDate = new Date('2024-01-01T10:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);

    defaultProps = {
      userId: 'user-123',
    };

    mockNanoid.mockReturnValue('mocked-token-123');
    mockDateFns.addHours.mockReturnValue(new Date('2024-01-01T11:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create password reset token with default generated values', () => {
      const token = new PasswordResetToken(defaultProps);
      const data = token.data;

      expect(data.id).toBe('generated-uuid-456');
      expect(data.userId).toBe(defaultProps.userId);
      expect(data.token).toBe('mocked-token-123');
      expect(data.createdAt).toEqual(fixedDate);
      expect(data.expiresAt).toEqual(new Date('2024-01-01T11:00:00Z'));
      expect(data.usedAt).toBeUndefined();
    });

    it('should use provided id if given', () => {
      const propsWithId = {
        ...defaultProps,
        id: 'custom-id-123' as UuidVo,
      };
      const token = new PasswordResetToken(propsWithId);

      expect(token.data.id).toBe('custom-id-123');
    });

    it('should use provided token if given', () => {
      const propsWithToken = {
        ...defaultProps,
        token: 'custom-reset-token-789',
      };
      const token = new PasswordResetToken(propsWithToken);

      expect(token.data.token).toBe('custom-reset-token-789');
    });

    it('should use provided createdAt if given', () => {
      const customDate = new Date('2025-01-01T00:00:00Z');
      const propsWithDate = {
        ...defaultProps,
        createdAt: customDate,
      };
      const token = new PasswordResetToken(propsWithDate);

      expect(token.data.createdAt).toEqual(customDate);
      expect(mockDateFns.addHours).toHaveBeenCalledWith(customDate, 1);
    });

    it('should use provided expiresAt if given', () => {
      const customExpiry = new Date('2025-01-01T12:00:00Z');
      const propsWithExpiry = {
        ...defaultProps,
        expiresAt: customExpiry,
      };
      const token = new PasswordResetToken(propsWithExpiry);

      expect(token.data.expiresAt).toEqual(customExpiry);
    });

    it('should use provided usedAt if given', () => {
      const usedDate = new Date('2024-01-01T09:00:00Z');
      const propsWithUsedAt = {
        ...defaultProps,
        usedAt: usedDate,
      };
      const token = new PasswordResetToken(propsWithUsedAt);

      expect(token.data.usedAt).toEqual(usedDate);
    });
  });

  describe('markAsUsed', () => {
    it('should set usedAt to current system time and track change', () => {
      const token = new PasswordResetToken(defaultProps);

      jest.setSystemTime(new Date('2024-01-01T10:30:00Z'));
      token.markAsUsed();

      expect(token.data.usedAt).toEqual(new Date('2024-01-01T10:30:00Z'));
      expect(token.hasChanges()).toBe(true);
      expect(token.getChanges()).toHaveProperty('usedAt');
    });
  });

  describe('isValid', () => {
    it('should return true if token is not used and expiresAt is in the future', () => {
      const token = new PasswordResetToken({
        ...defaultProps,
        expiresAt: new Date('2024-01-01T11:00:00Z'),
      });

      expect(token.isValid()).toBe(true);
    });

    it('should return false if token has already been used', () => {
      const token = new PasswordResetToken({
        ...defaultProps,
        expiresAt: new Date('2024-01-01T11:00:00Z'),
      });

      token.markAsUsed();
      expect(token.isValid()).toBe(false);
    });

    it('should return false if token is expired', () => {
      const token = new PasswordResetToken({
        ...defaultProps,
        expiresAt: new Date('2024-01-01T11:00:00Z'),
      });

      jest.setSystemTime(new Date('2024-01-01T11:05:00Z'));
      expect(token.isValid()).toBe(false);
    });
  });

  describe('change tracking', () => {
    it('should not have changes initially', () => {
      const token = new PasswordResetToken(defaultProps);
      expect(token.hasChanges()).toBe(false);
    });

    it('should clear changes when commitChanges is called', () => {
      const token = new PasswordResetToken(defaultProps);
      token.markAsUsed();
      expect(token.hasChanges()).toBe(true);

      token.commitChanges();
      expect(token.hasChanges()).toBe(false);
    });
  });
});
