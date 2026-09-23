import { Inject, Injectable } from '@nestjs/common';
import {
  type FindNotificationOptions,
  InAppNotification,
  type InAppNotificationProps,
  type InAppNotificationRepositoryDrivenPort,
  type PaginatedNotificationsResult,
} from '@core/domain';
import {
  InAppNotificationTypeOrmEntity,
  MAIN_DATA_SOURCE,
} from '@core/database';
import type { DataSource, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class TypeOrmInAppNotificationAdapter
  implements InAppNotificationRepositoryDrivenPort
{
  private readonly repository: Repository<InAppNotificationTypeOrmEntity>;

  constructor(@Inject(MAIN_DATA_SOURCE) dataSource: DataSource) {
    this.repository = dataSource.getRepository(InAppNotificationTypeOrmEntity);
  }

  async save(notification: InAppNotification): Promise<InAppNotification> {
    const data = notification.data;
    const entity = this.repository.create({
      id: data.id,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type as unknown as InAppNotificationTypeOrmEntity['type'],
      data: data.metadata,
      isRead: data.isRead,
      readAt: data.readAt,
    });

    const savedEntity: InAppNotificationTypeOrmEntity =
      await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async findById(id: string): Promise<InAppNotification | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAndCountByUserId(
    options: FindNotificationOptions,
  ): Promise<PaginatedNotificationsResult> {
    const { userId, page = 1, limit = 20, isRead } = options;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<InAppNotificationTypeOrmEntity> = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [entities, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const unreadCount = await this.repository.count({
      where: { userId, isRead: false },
    });

    return {
      notifications: entities.map((e) => this.toDomain(e)),
      total,
      unreadCount,
    };
  }

  async markAsRead(
    id: string,
    userId: string,
  ): Promise<InAppNotification | null> {
    const entity = await this.repository.findOne({ where: { id, userId } });
    if (!entity) {
      return null;
    }

    if (!entity.isRead) {
      entity.isRead = true;
      entity.readAt = new Date();
      await this.repository.save(entity);
    }

    return this.toDomain(entity);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.repository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return result.affected ?? 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.count({ where: { userId, isRead: false } });
  }

  private toDomain(entity: InAppNotificationTypeOrmEntity): InAppNotification {
    return new InAppNotification({
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      message: entity.message,
      type: entity.type as unknown as InAppNotificationProps['type'],
      metadata: entity.data,
      isRead: entity.isRead,
      readAt: entity.readAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
