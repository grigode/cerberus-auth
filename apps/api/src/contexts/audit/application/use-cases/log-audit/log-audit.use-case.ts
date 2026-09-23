import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AUDIT_STORAGE_DRIVEN_PORT_TOKEN,
  AuditStatus,
  type AuditStorageDrivenPort,
  type CreateAuditLogDto,
} from '@core/domain';
import { RequestContextService, type UseCase } from '@core/shared-server';

import type { LogAuditDto } from './log-audit.dto';

@Injectable()
export class LogAuditUseCase implements UseCase<LogAuditDto, void> {
  private readonly logger = new Logger(LogAuditUseCase.name);

  constructor(
    @Inject(AUDIT_STORAGE_DRIVEN_PORT_TOKEN)
    private readonly storageAdapter: AuditStorageDrivenPort,
  ) {}

  async execute(dto: LogAuditDto): Promise<void> {
    const store = RequestContextService.getStore();

    const fullDto: CreateAuditLogDto = {
      correlationId: dto.correlationId || store?.correlationId,
      userId: dto.userId || store?.userId,
      ipAddress: dto.ipAddress || store?.ipAddress,
      userAgent: dto.userAgent || store?.userAgent,
      action: dto.action,
      category: dto.category || 'SECURITY',
      entityName: dto.entityName,
      entityId: dto.entityId,
      status: dto.status || AuditStatus.SUCCESS,
      details: dto.details,
    };

    // Non-blocking fire-and-forget execution with error logging
    setImmediate(() => {
      this.storageAdapter.save(fullDto).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Background audit logging failed: ${msg}`);
      });
    });

    await Promise.resolve();
  }
}
