import * as datefns from 'date-fns';
import { nanoid } from 'nanoid';
import type { UuidVo } from '../../common';

import { RefreshToken, type RefreshTokenProps } from './refresh-token.entity';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-refresh-token-123'),
}));
jest.mock('date-fns', () => ({
  addDays: jest.fn((date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDay() + days);
    return result;
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

describe('RefreshToken', () => {
  let defaultProps: RefreshTokenProps;
  let fixedDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();

    fixedDate = new Date('2024-01-01T10:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);

    defaultProps = {
      userId: 'user-123',
    };

    mockNanoid.mockReturnValue('mocked-refresh-token-123');
    mockDateFns.addDays.mockReturnValue(new Date('2024-01-08T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create token with generated values', () => {
      const token = new RefreshToken(defaultProps);
      const data = token.data;

      expect(data.id).toBe('generated-uuid-456');
      expect(data.userId).toBe(defaultProps.userId);
      expect(data.token).toBe('mocked-refresh-token-123');
      expect(data.createdAt).toEqual(fixedDate);
      expect(data.expiresAt).toEqual(new Date('2024-01-08T10:00:00Z'));
      expect(data.revokedAt).toBeUndefined();
    });

    it('should use provided id if given', () => {
      const propsWithId = {
        ...defaultProps,
        id: 'custom-id-123' as UuidVo,
      };
      const token = new RefreshToken(propsWithId);

      expect(token.data.id).toBe('custom-id-123');
    });

    it('should use provided token if given', () => {
      const propsWithToken = {
        ...defaultProps,
        token: 'custom-token-789',
      };
      const token = new RefreshToken(propsWithToken);

      expect(token.data.token).toBe('custom-token-789');
    });

    it('should use provided createdAt if given', () => {
      const customDate = new Date('2025-01-01T00:00:00Z');
      const propsWithDate = {
        ...defaultProps,
        createdAt: customDate,
      };
      const token = new RefreshToken(propsWithDate);

      expect(token.data.createdAt).toEqual(customDate);
    });

    it('should use provided expiresAt if given', () => {
      const customExpiry = new Date('2025-01-01T12:00:00Z');
      const propsWithExpiry = {
        ...defaultProps,
        expiresAt: customExpiry,
      };
      const token = new RefreshToken(propsWithExpiry);

      expect(token.data.expiresAt).toEqual(customExpiry);
    });

    it('should use provided revokedAt if given', () => {
      const revokedDate = new Date('2024-01-01T09:00:00Z');
      const propsWithRevokedAt = {
        ...defaultProps,
        revokedAt: revokedDate,
      };
      const token = new RefreshToken(propsWithRevokedAt);

      expect(token.data.revokedAt).toEqual(revokedDate);
    });
  });

  describe('revoke', () => {
    it('should set revokedAt to current date', () => {
      const token = new RefreshToken(defaultProps);

      jest.setSystemTime(new Date('2024-01-01T10:30:00Z'));
      token.revoke();

      expect(token.data.revokedAt).toEqual(new Date('2024-01-01T10:30:00Z'));
    });

    it('should overwrite existing revokedAt if called again', () => {
      const token = new RefreshToken(defaultProps);

      jest.setSystemTime(new Date('2024-01-01T10:30:00Z'));
      token.revoke();
      const firstRevoked = token.data.revokedAt;

      jest.setSystemTime(new Date('2024-01-01T11:00:00Z'));
      token.revoke();

      expect(token.data.revokedAt).not.toEqual(firstRevoked);
      expect(token.data.revokedAt).toEqual(new Date('2024-01-01T11:00:00Z'));
    });
  });

  describe('Edge cases', () => {
    it('should handle expiration exactly at created + 7 days', () => {
      mockDateFns.addDays.mockImplementation((date, day) => {
        const result = new Date(date);
        result.setDate(result.getDay() + day);
        return result;
      });

      const token = new RefreshToken(defaultProps);
      const expectedExpiry = new Date(fixedDate);
      expectedExpiry.setDate(expectedExpiry.getDay() + 7);

      expect(token.data.expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });

    it('should maintain immutability of dates when exposed through data getter', () => {
      const token = new RefreshToken(defaultProps);
      const originalCreatedAt = token.data.createdAt;
      const originalExpiresAt = token.data.expiresAt;

      token.data.createdAt.setHours(99);
      token.data.expiresAt.setHours(99);

      expect(token.data.createdAt).toEqual(originalCreatedAt);
      expect(token.data.expiresAt).toEqual(originalExpiresAt);
    });
  });
});
