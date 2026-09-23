import { AuditStatus, type AuditStorageDrivenPort } from '@core/domain';
import { LogAuditUseCase } from './log-audit.use-case';

describe('LogAuditUseCase', () => {
  let useCase: LogAuditUseCase;
  let mockAdapter: jest.Mocked<AuditStorageDrivenPort>;

  beforeEach(() => {
    mockAdapter = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new LogAuditUseCase(mockAdapter);
  });

  it('should call storageAdapter.save asynchronously with default SECURITY category', (done) => {
    void useCase.execute({
      action: 'USER_LOGIN_SUCCESS',
      userId: 'user-123',
    });

    setImmediate(() => {
      expect(mockAdapter.save).toHaveBeenCalledTimes(1);
      expect(mockAdapter.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_LOGIN_SUCCESS',
          userId: 'user-123',
          category: 'SECURITY',
          status: AuditStatus.SUCCESS,
        }),
      );
      done();
    });
  });
});
