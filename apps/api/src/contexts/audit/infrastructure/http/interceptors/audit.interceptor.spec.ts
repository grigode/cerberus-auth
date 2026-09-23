import { of } from 'rxjs';
import { AuditStatus } from '@core/domain';
import { AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let reflectorMock: any;
  let auditUseCaseMock: any;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };
    auditUseCaseMock = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    interceptor = new AuditInterceptor(reflectorMock, auditUseCaseMock);
  });

  it('should mask sensitive fields in request body when logging', (done) => {
    reflectorMock.getAllAndOverride.mockReturnValue({
      action: 'EMAIL_LOGIN',
      category: 'SECURITY',
      entityName: 'User',
    });

    const contextMock: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          body: {
            email: 'user@example.com',
            password: 'SuperSecretPassword123!',
          },
        }),
      }),
    };

    const nextMock: any = {
      handle: () => of({ success: true }),
    };

    interceptor.intercept(contextMock, nextMock).subscribe({
      complete: () => {
        expect(auditUseCaseMock.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'EMAIL_LOGIN',
            status: AuditStatus.SUCCESS,
            details: {
              body: {
                email: 'user@example.com',
                password: '***MASKED***',
              },
            },
          }),
        );
        done();
      },
    });
  });
});
