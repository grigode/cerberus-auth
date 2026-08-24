import type { AuditStatus } from './audit-status.enum';

export interface CreateAuditLogDto {
  correlationId?: string;
  userId?: string;
  action: string;
  category?: string;
  entityName?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
  details?: Record<string, unknown>;
}

export interface AuditStorageDrivenPort {
  save(auditLog: CreateAuditLogDto): Promise<void>;
}

export type IAuditStorageAdapter = AuditStorageDrivenPort;
