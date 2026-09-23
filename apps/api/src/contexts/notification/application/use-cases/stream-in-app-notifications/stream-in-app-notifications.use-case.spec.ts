import { of } from 'rxjs';
import { StreamInAppNotificationsUseCase } from './stream-in-app-notifications.use-case';

describe('StreamInAppNotificationsUseCase', () => {
  let useCase: StreamInAppNotificationsUseCase;
  const mockBroadcaster = {
    subscribeUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new StreamInAppNotificationsUseCase(mockBroadcaster as any);
  });

  it('should delegate to broadcaster subscribeUser', async () => {
    const userId = 'user-uuid-123';
    const mockStream$ = of({ type: 'ping', data: {} });
    mockBroadcaster.subscribeUser.mockReturnValue(mockStream$);

    const stream$ = await useCase.execute({ userId });

    expect(mockBroadcaster.subscribeUser).toHaveBeenCalledWith(userId);
    expect(stream$).toBe(mockStream$);
  });
});
