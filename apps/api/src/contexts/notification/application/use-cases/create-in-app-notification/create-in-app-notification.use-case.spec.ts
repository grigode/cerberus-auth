import { InAppNotification, InAppNotificationType } from '@core/domain';
import { CreateInAppNotificationUseCase } from './create-in-app-notification.use-case';

describe('CreateInAppNotificationUseCase', () => {
  let useCase: CreateInAppNotificationUseCase;
  const mockRepository = {
    save: jest.fn(),
  };
  const mockBroadcaster = {
    publishToUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateInAppNotificationUseCase(
      mockRepository as any,
      mockBroadcaster as any,
    );
  });

  it('should save notification to repository and broadcast live event', async () => {
    const userId = 'user-uuid-123';
    const savedNotification = new InAppNotification({
      id: 'notification-id-1',
      userId,
      title: 'Welcome',
      message: 'Hello World',
      type: InAppNotificationType.INFO,
    });

    mockRepository.save.mockResolvedValue(savedNotification);

    const result = await useCase.execute({
      userId,
      title: 'Welcome',
      message: 'Hello World',
      type: InAppNotificationType.INFO,
    });

    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockBroadcaster.publishToUser).toHaveBeenCalledWith(
      userId,
      savedNotification,
    );
    expect(result).toBe(savedNotification);
  });
});
