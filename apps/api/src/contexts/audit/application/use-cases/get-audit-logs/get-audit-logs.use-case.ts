import { Inject, Injectable } from '@nestjs/common';
import {
  AUDIT_STORAGE_DRIVEN_PORT_TOKEN,
  type AuditStorageDrivenPort,
  type PaginatedAuditLogs,
} from '@core/domain';
import type { UseCase } from '@core/shared-server';
import type { GetAuditLogsDto } from './get-audit-logs.dto';

@Injectable()
export class GetAuditLogsUseCase
  implements UseCase<GetAuditLogsDto, PaginatedAuditLogs>
{
  constructor(
    @Inject(AUDIT_STORAGE_DRIVEN_PORT_TOKEN)
    private readonly storageAdapter: AuditStorageDrivenPort,
  ) {}

  async execute(dto: GetAuditLogsDto): Promise<PaginatedAuditLogs> {
    return this.storageAdapter.findAndCount({
      userId: dto.userId,
      action: dto.action,
      category: dto.category,
      entityName: dto.entityName,
      status: dto.status,
      limit: dto.limit ?? 50,
      offset: dto.offset ?? 0,
    });
  }
}
