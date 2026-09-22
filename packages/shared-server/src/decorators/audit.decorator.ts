import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA_KEY = Symbol('AUDIT_METADATA');

export interface AuditOptions {
  action: string;
  category?: string;
  entityName?: string;
}

export const AuditAction = (options: AuditOptions) =>
  SetMetadata(AUDIT_METADATA_KEY, options);

export const AuditLogDecorator = AuditAction;
