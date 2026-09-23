import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AuditStatus,
  type AuditStorageDrivenPort,
  type CreateAuditLogDto,
  type FindAuditLogsOptions,
  type PaginatedAuditLogs,
  generateUuid,
} from '@core/domain';
import { sanitizeData } from '@core/shared-server';
import { AuditLogTypeOrmEntity, MAIN_DATA_SOURCE } from '@core/database';
import type { DataSource, Repository } from 'typeorm';

@Injectable()
export class TypeOrmAuditStorageAdapter implements AuditStorageDrivenPort {
  private readonly logger = new Logger(TypeOrmAuditStorageAdapter.name);
  private readonly repository: Repository<AuditLogTypeOrmEntity>;

  constructor(@Inject(MAIN_DATA_SOURCE) dataSource: DataSource) {
    this.repository = dataSource.getRepository(AuditLogTypeOrmEntity);
  }

  async save(auditLog: CreateAuditLogDto): Promise<void> {
    try {
      const sanitizedDetails = auditLog.details
        ? sanitizeData(auditLog.details)
        : undefined;

      const entity = this.repository.create({
        id: generateUuid(),
        correlationId: auditLog.correlationId,
        userId: auditLog.userId,
        action: auditLog.action,
        category: auditLog.category || 'SECURITY',
        entityName: auditLog.entityName,
        entityId: auditLog.entityId,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        status: auditLog.status || AuditStatus.SUCCESS,
        details: sanitizedDetails,
      });

      await this.repository.save(entity);
    } catch (error: unknown) {
      const errObj = error as { message?: string; stack?: string };
      const msg = errObj.message || String(error);
      this.logger.error(
        `Failed to persist audit log [action=${auditLog.action}, category=${auditLog.category}]: ${msg}`,
        errObj.stack,
      );
      throw error;
    }
  }

  async findAndCount(
    options: FindAuditLogsOptions,
  ): Promise<PaginatedAuditLogs> {
    const where: Record<string, unknown> = {};
    if (options.userId) where.userId = options.userId;
    if (options.action) where.action = options.action;
    if (options.category) where.category = options.category;
    if (options.entityName) where.entityName = options.entityName;
    if (options.status) where.status = options.status;

    const [items, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: options.limit ?? 50,
      skip: options.offset ?? 0,
    });

    return {
      data: items.map((item) => ({
        id: item.id,
        correlationId: item.correlationId,
        userId: item.userId,
        action: item.action,
        category: item.category,
        entityName: item.entityName,
        entityId: item.entityId,
        ipAddress: item.ipAddress,
        userAgent: item.userAgent,
        status: item.status as AuditStatus,
        details: item.details,
        createdAt: item.createdAt,
      })),
      total,
    };
  }
}
