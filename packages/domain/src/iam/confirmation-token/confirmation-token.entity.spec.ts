import * as datefns from 'date-fns';
import { nanoid } from 'nanoid';
import type { UuidVo } from '../../common';

import {
  ConfirmationToken,
  type ConfirmationTokenProps,
} from './confirmation-token.entity';

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

describe('ConfirmationToken', () => {
  let defaultProps: ConfirmationTokenProps;
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
    it('should create token with generated values', () => {
      const token = new ConfirmationToken(defaultProps);
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
      const token = new ConfirmationToken(propsWithId);

      expect(token.data.id).toBe('custom-id-123');
    });

    it('should use provided token if given', () => {
      const propsWithToken = {
        ...defaultProps,
        token: 'custom-token-789',
      };
      const token = new ConfirmationToken(propsWithToken);

      expect(token.data.token).toBe('custom-token-789');
    });

    it('should use provided createdAt if given', () => {
      const customDate = new Date('2025-01-01T00:00:00Z');
      const propsWithDate = {
        ...defaultProps,
        createdAt: customDate,
      };
      const token = new ConfirmationToken(propsWithDate);

      expect(token.data.createdAt).toEqual(customDate);
      expect(mockDateFns.addHours).toHaveBeenCalledWith(customDate, 1);
    });

    it('should use provided expiresAt if given', () => {
      const customExpiry = new Date('2025-01-01T12:00:00Z');
      const propsWithExpiry = {
        ...defaultProps,
        expiresAt: customExpiry,
      };
      const token = new ConfirmationToken(propsWithExpiry);

      expect(token.data.expiresAt).toEqual(customExpiry);
      expect(mockDateFns.addHours).not.toHaveBeenCalled();
    });

    it('should use provided usedAt if given', () => {
      const usedDate = new Date('2024-01-01T09:00:00Z');
      const propsWithUsedAt = {
        ...defaultProps,
        usedAt: usedDate,
      };
      const token = new ConfirmationToken(propsWithUsedAt);

      expect(token.data.usedAt).toEqual(usedDate);
    });
  });

  describe('markAsUsed', () => {
    it('should set usedAt to current date', () => {
      const token = new ConfirmationToken(defaultProps);

      jest.setSystemTime(new Date('2024-01-01T10:30:00Z'));
      token.markAsUsed();

      expect(token.data.usedAt).toEqual(new Date('2024-01-01T10:30:00Z'));
    });

    it('should overwrite existing usedAt if called again', () => {
      const token = new ConfirmationToken(defaultProps);

      jest.setSystemTime(new Date('2024-01-01T10:30:00Z'));
      token.markAsUsed();
      const firstUsed = token.data.usedAt;

      jest.setSystemTime(new Date('2024-01-01T11:00:00Z'));
      token.markAsUsed();

      expect(token.data.usedAt).not.toEqual(firstUsed);
      expect(token.data.usedAt).toEqual(new Date('2024-01-01T11:00:00Z'));
    });
  });

  describe('isValid', () => {
    it('should return true if token is not used and not expired', () => {
      const token = new ConfirmationToken({
        ...defaultProps,
        expiresAt: new Date('2024-01-01T11:00:00Z'),
      });

      expect(token.isValid()).toBe(true);
    });

    it('should return false if token is already used', () => {
      const token = new ConfirmationToken({
        ...defaultProps,
        expiresAt: new Date('2024-01-01T11:00:00Z'),
      });

      token.markAsUsed();
      expect(token.isValid()).toBe(false);
    });

    it('should return false if token is expired', () => {
      const token = new ConfirmationToken({
        ...defaultProps,
        expiresAt: new Date('2024-01-01T11:00:00Z'),
      });

      jest.setSystemTime(new Date('2024-01-01T11:05:00Z'));
      expect(token.isValid()).toBe(false);
    });

    it('should return false if token is exactly at expiration time', () => {
      const token = new ConfirmationToken({
        ...defaultProps,
        expiresAt: new Date('2024-01-01T11:00:00Z'),
      });

      jest.setSystemTime(new Date('2024-01-01T11:00:00Z'));
      expect(token.isValid()).toBe(false);
    });
  });

  describe('change tracking', () => {
    it('should not have changes initially', () => {
      const token = new ConfirmationToken(defaultProps);
      expect(token.hasChanges()).toBe(false);
      expect(token.getChanges()).toEqual({});
    });

    it('should track changes when marked as used', () => {
      const token = new ConfirmationToken(defaultProps);
      token.markAsUsed();
      expect(token.hasChanges()).toBe(true);
      expect(token.getChanges()).toHaveProperty('usedAt');
      expect(token.getChanges().usedAt).toBeInstanceOf(Date);
    });

    it('should clear changes when committing', () => {
      const token = new ConfirmationToken(defaultProps);
      token.markAsUsed();
      expect(token.hasChanges()).toBe(true);

      token.commitChanges();

      expect(token.hasChanges()).toBe(false);
      expect(token.getChanges()).toEqual({});
    });
  });

  describe('Edge cases', () => {
    it('should handle expiration exactly at created + 1 hour', () => {
      mockDateFns.addHours.mockImplementation((date, hours) => {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
      });

      const token = new ConfirmationToken(defaultProps);
      const expectedExpiry = new Date(fixedDate);
      expectedExpiry.setHours(expectedExpiry.getHours() + 1);

      expect(token.data.expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });

    it('should maintain immutability of dates', () => {
      const token = new ConfirmationToken(defaultProps);
      const originalCreatedAt = token.data.createdAt;
      const originalExpiresAt = token.data.expiresAt;

      token.data.createdAt.setHours(99);
      token.data.expiresAt.setHours(99);

      expect(token.data.createdAt).toEqual(originalCreatedAt);
      expect(token.data.expiresAt).toEqual(originalExpiresAt);
    });
  });
});
