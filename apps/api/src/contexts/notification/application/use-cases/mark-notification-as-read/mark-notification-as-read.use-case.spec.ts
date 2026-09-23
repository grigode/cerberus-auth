import { InAppNotification } from '@core/domain';
import { NotificationNotFoundException } from '../../exceptions';
import { MarkNotificationAsReadUseCase } from './mark-notification-as-read.use-case';

describe('MarkNotificationAsReadUseCase', () => {
  let useCase: MarkNotificationAsReadUseCase;
  const mockRepository = {
    markAsRead: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new MarkNotificationAsReadUseCase(mockRepository as any);
  });

  it('should mark notification as read successfully', async () => {
    const userId = 'user-uuid-123';
    const notificationId = 'notif-1';
    const notification = new InAppNotification({
      id: notificationId,
      userId,
      title: 'Title',
      message: 'Msg',
      isRead: true,
    });

    mockRepository.markAsRead.mockResolvedValue(notification);

    const result = await useCase.execute({ id: notificationId, userId });

    expect(mockRepository.markAsRead).toHaveBeenCalledWith(
      notificationId,
      userId,
    );
    expect(result).toBe(notification);
  });

  it('should throw NotificationNotFoundException when notification does not exist or user mismatch', async () => {
    mockRepository.markAsRead.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'invalid-id', userId: 'user-1' }),
    ).rejects.toThrow(NotificationNotFoundException);
  });
});
