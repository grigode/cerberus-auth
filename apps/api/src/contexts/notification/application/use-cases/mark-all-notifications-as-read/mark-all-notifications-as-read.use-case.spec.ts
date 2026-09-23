import { MarkAllNotificationsAsReadUseCase } from './mark-all-notifications-as-read.use-case';

describe('MarkAllNotificationsAsReadUseCase', () => {
  let useCase: MarkAllNotificationsAsReadUseCase;
  const mockRepository = {
    markAllAsRead: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new MarkAllNotificationsAsReadUseCase(mockRepository as any);
  });

  it('should mark all notifications as read and return updated count', async () => {
    const userId = 'user-uuid-123';
    mockRepository.markAllAsRead.mockResolvedValue(5);

    const result = await useCase.execute({ userId });

    expect(mockRepository.markAllAsRead).toHaveBeenCalledWith(userId);
    expect(result).toEqual({ updatedCount: 5 });
  });
});
