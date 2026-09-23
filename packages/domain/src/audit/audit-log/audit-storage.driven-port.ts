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

export const AUDIT_STORAGE_DRIVEN_PORT_TOKEN = Symbol(
  'AUDIT_STORAGE_DRIVEN_PORT_TOKEN',
);

export const AUDIT_STORAGE_ADAPTER = AUDIT_STORAGE_DRIVEN_PORT_TOKEN;

export interface AuditStorageDrivenPort {
  save(auditLog: CreateAuditLogDto): Promise<void>;
}

export type IAuditStorageAdapter = AuditStorageDrivenPort;
