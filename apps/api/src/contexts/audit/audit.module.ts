import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AUDIT_STORAGE_DRIVEN_PORT_TOKEN } from '@core/domain';

import { LogAuditUseCase } from './application';
import { AuditInterceptor, TypeOrmAuditStorageAdapter } from './infrastructure';

@Global()
@Module({
  providers: [
    LogAuditUseCase,
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
  exports: [LogAuditUseCase, AuditInterceptor, AUDIT_STORAGE_DRIVEN_PORT_TOKEN],
})
export class AuditModule {}
