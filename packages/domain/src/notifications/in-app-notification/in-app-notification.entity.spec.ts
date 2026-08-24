import {
  InAppNotification,
  type InAppNotificationProps,
} from './in-app-notification.entity';
import { InAppNotificationVo } from './in-app-notification.vo';

jest.mock('../../common', () => {
  const actual = jest.requireActual('../../common');
  return {
    ...actual,
    generateUuid: jest.fn(() => 'generated-uuid-123'),
  };
});

describe('InAppNotification', () => {
  let defaultProps: InAppNotificationProps;
  let fixedDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();

    fixedDate = new Date('2024-01-01T10:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);

    defaultProps = {
      userId: 'user-123',
      title: 'Welcome',
      message: 'Welcome to the platform',
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create notification with default generated values', () => {
      const notification = new InAppNotification(defaultProps);
      const data = notification.data;

      expect(data.id).toBe('generated-uuid-123');
      expect(data.userId).toBe(defaultProps.userId);
      expect(data.title).toBe(defaultProps.title);
      expect(data.message).toBe(defaultProps.message);
      expect(data.type).toBe(InAppNotificationVo.INFO);
      expect(data.metadata).toBeUndefined();
      expect(data.isRead).toBe(false);
      expect(data.readAt).toBeNull();
      expect(data.createdAt).toEqual(fixedDate);
      expect(data.updatedAt).toEqual(fixedDate);
    });

    it('should use provided id if given', () => {
      const notification = new InAppNotification({
        ...defaultProps,
        id: 'custom-id-456',
      });

      expect(notification.data.id).toBe('custom-id-456');
    });

    it('should use provided type if given', () => {
      const notification = new InAppNotification({
        ...defaultProps,
        type: InAppNotificationVo.WARNING,
      });

      expect(notification.data.type).toBe(InAppNotificationVo.WARNING);
    });

    it('should use provided metadata if given', () => {
      const metadata = { actionUrl: '/settings', priority: 'high' };
      const notification = new InAppNotification({
        ...defaultProps,
        metadata,
      });

      expect(notification.data.metadata).toEqual(metadata);
    });

    it('should handle isRead true with auto-generated readAt', () => {
      const notification = new InAppNotification({
        ...defaultProps,
        isRead: true,
      });

      expect(notification.data.isRead).toBe(true);
      expect(notification.data.readAt).toEqual(fixedDate);
    });

    it('should use provided readAt, createdAt and updatedAt if given', () => {
      const customReadAt = new Date('2024-01-01T08:00:00Z');
      const customCreatedAt = new Date('2024-01-01T07:00:00Z');
      const customUpdatedAt = new Date('2024-01-01T09:00:00Z');

      const notification = new InAppNotification({
        ...defaultProps,
        isRead: true,
        readAt: customReadAt,
        createdAt: customCreatedAt,
        updatedAt: customUpdatedAt,
      });

      expect(notification.data.readAt).toEqual(customReadAt);
      expect(notification.data.createdAt).toEqual(customCreatedAt);
      expect(notification.data.updatedAt).toEqual(customUpdatedAt);
    });
  });

  describe('markAsRead', () => {
    it('should set isRead to true, update readAt and updatedAt when notification is unread', () => {
      const notification = new InAppNotification(defaultProps);
      expect(notification.data.isRead).toBe(false);
      expect(notification.data.readAt).toBeNull();

      const newTime = new Date('2024-01-01T10:30:00Z');
      jest.setSystemTime(newTime);

      notification.markAsRead();

      expect(notification.data.isRead).toBe(true);
      expect(notification.data.readAt).toEqual(newTime);
      expect(notification.data.updatedAt).toEqual(newTime);
    });

    it('should do nothing if notification is already read', () => {
      const initialReadAt = new Date('2024-01-01T08:00:00Z');
      const initialUpdatedAt = new Date('2024-01-01T08:00:00Z');

      const notification = new InAppNotification({
        ...defaultProps,
        isRead: true,
        readAt: initialReadAt,
        updatedAt: initialUpdatedAt,
      });

      jest.setSystemTime(new Date('2024-01-01T11:00:00Z'));

      notification.markAsRead();

      expect(notification.data.isRead).toBe(true);
      expect(notification.data.readAt).toEqual(initialReadAt);
      expect(notification.data.updatedAt).toEqual(initialUpdatedAt);
    });
  });

  describe('encapsulation', () => {
    it('should not allow modifying properties directly on the instance', () => {
      const notification = new InAppNotification(defaultProps);

      (notification as unknown as Record<string, string>).title = 'Hacked';
      (notification as unknown as Record<string, string>).message =
        'Hacked message';

      expect(notification.data.title).toBe(defaultProps.title);
      expect(notification.data.message).toBe(defaultProps.message);
    });
  });
});
