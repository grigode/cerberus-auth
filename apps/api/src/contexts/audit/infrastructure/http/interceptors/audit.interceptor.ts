import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditStatus } from '@core/domain';
import {
  AUDIT_METADATA_KEY,
  type AuditOptions,
  sanitizeData,
} from '@core/shared-server';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LogAuditUseCase } from '../../../application';

interface HttpPayload {
  params?: Record<string, string>;
  body?: Record<string, unknown>;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditUseCase: LogAuditUseCase,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditOptions = this.reflector.getAllAndOverride<AuditOptions>(
      AUDIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditOptions) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<HttpPayload>();
    const params = req?.params;
    const body = req?.body;

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const resObj = data as { id?: string } | undefined;
          const entityId = params?.id || resObj?.id;

          void this.auditUseCase.execute({
            action: auditOptions.action,
            category: auditOptions.category || 'BUSINESS',
            entityName: auditOptions.entityName,
            entityId,
            status: AuditStatus.SUCCESS,
            details: {
              ...(params ? { params: sanitizeData(params) } : {}),
              ...(body ? { body: sanitizeData(body) } : {}),
            },
          });
        },
        error: (error: unknown) => {
          const errObj = error as { message?: string };
          const errMsg = errObj.message || String(error);

          void this.auditUseCase.execute({
            action: auditOptions.action,
            category: auditOptions.category || 'BUSINESS',
            entityName: auditOptions.entityName,
            entityId: params?.id,
            status: AuditStatus.FAILURE,
            details: {
              ...(params ? { params: sanitizeData(params) } : {}),
              errorMessage: errMsg,
            },
          });
        },
      }),
    );
  }
}
