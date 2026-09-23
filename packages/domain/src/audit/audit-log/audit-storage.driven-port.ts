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

export interface AuditLogItem {
  id: string;
  correlationId?: string;
  userId?: string;
  action: string;
  category: string;
  entityName?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: AuditStatus;
  details?: Record<string, unknown>;
  createdAt: Date;
}

export interface FindAuditLogsOptions {
  userId?: string;
  action?: string;
  category?: string;
  entityName?: string;
  status?: AuditStatus;
  limit?: number;
  offset?: number;
}

export interface PaginatedAuditLogs {
  data: AuditLogItem[];
  total: number;
}

export const AUDIT_STORAGE_DRIVEN_PORT_TOKEN = Symbol(
  'AUDIT_STORAGE_DRIVEN_PORT_TOKEN',
);

export const AUDIT_STORAGE_ADAPTER = AUDIT_STORAGE_DRIVEN_PORT_TOKEN;

export interface AuditStorageDrivenPort {
  save(auditLog: CreateAuditLogDto): Promise<void>;
  findAndCount(options: FindAuditLogsOptions): Promise<PaginatedAuditLogs>;
}

export type IAuditStorageAdapter = AuditStorageDrivenPort;
