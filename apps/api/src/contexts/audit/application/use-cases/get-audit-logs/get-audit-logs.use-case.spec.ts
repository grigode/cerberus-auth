import { AuditStatus, type AuditStorageDrivenPort } from '@core/domain';
import { GetAuditLogsUseCase } from './get-audit-logs.use-case';

describe('GetAuditLogsUseCase', () => {
  let useCase: GetAuditLogsUseCase;
  let mockAdapter: jest.Mocked<AuditStorageDrivenPort>;

  beforeEach(() => {
    mockAdapter = {
      save: jest.fn(),
      findAndCount: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'audit-1',
            action: 'USER_LOGIN',
            category: 'SECURITY',
            status: AuditStatus.SUCCESS,
            createdAt: new Date(),
          },
        ],
        total: 1,
      }),
    };
    useCase = new GetAuditLogsUseCase(mockAdapter);
  });

  it('should query storageAdapter with provided filters and default pagination', async () => {
    const result = await useCase.execute({
      action: 'USER_LOGIN',
      category: 'SECURITY',
    });

    expect(mockAdapter.findAndCount).toHaveBeenCalledWith({
      action: 'USER_LOGIN',
      category: 'SECURITY',
      limit: 50,
      offset: 0,
      entityName: undefined,
      status: undefined,
      userId: undefined,
    });
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('should use custom pagination limits and offset when supplied', async () => {
    await useCase.execute({
      limit: 10,
      offset: 20,
    });

    expect(mockAdapter.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        offset: 20,
      }),
    );
  });
});
