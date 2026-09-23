import type { AuditStatus } from '@core/domain';

export interface LogAuditDto {
  action: string;
  category?: string;
  correlationId?: string;
  userId?: string;
  entityName?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
  details?: Record<string, unknown>;
}
