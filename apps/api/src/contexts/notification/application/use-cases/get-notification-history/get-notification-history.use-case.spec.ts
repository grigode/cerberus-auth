import { InAppNotification } from '@core/domain';
import { GetNotificationHistoryUseCase } from './get-notification-history.use-case';

describe('GetNotificationHistoryUseCase', () => {
  let useCase: GetNotificationHistoryUseCase;
  const mockRepository = {
    findAndCountByUserId: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetNotificationHistoryUseCase(mockRepository as any);
  });

  it('should return paginated notification history and unread count', async () => {
    const userId = 'user-uuid-123';
    const notification = new InAppNotification({
      id: 'n-1',
      userId,
      title: 'Title',
      message: 'Msg',
    });

    const expectedResult = {
      notifications: [notification],
      total: 1,
      unreadCount: 1,
    };

    mockRepository.findAndCountByUserId.mockResolvedValue(expectedResult);

    const result = await useCase.execute({ userId, page: 1, limit: 10 });

    expect(mockRepository.findAndCountByUserId).toHaveBeenCalledWith({
      userId,
      page: 1,
      limit: 10,
      isRead: undefined,
    });
    expect(result).toBe(expectedResult);
  });
});
