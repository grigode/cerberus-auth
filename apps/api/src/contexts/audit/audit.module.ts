import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AUDIT_STORAGE_DRIVEN_PORT_TOKEN } from '@core/domain';

import { GetAuditLogsUseCase, LogAuditUseCase } from './application';
import {
  AuditInterceptor,
  TypeOrmAuditStorageAdapter,
  auditControllers,
} from './infrastructure';

@Global()
@Module({
  controllers: [...auditControllers],
  providers: [
    LogAuditUseCase,
    GetAuditLogsUseCase,
    AuditInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: AUDIT_STORAGE_DRIVEN_PORT_TOKEN,
      useClass: TypeOrmAuditStorageAdapter,
    },
  ],
  exports: [
    LogAuditUseCase,
    GetAuditLogsUseCase,
    AuditInterceptor,
    AUDIT_STORAGE_DRIVEN_PORT_TOKEN,
  ],
})
export class AuditModule {}
