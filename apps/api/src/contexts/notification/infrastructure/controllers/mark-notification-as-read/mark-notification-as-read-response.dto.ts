import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type InAppNotification, InAppNotificationType } from '@core/domain';

export class MarkNotificationAsReadResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  userId: string;

  @ApiProperty({ example: 'Welcome to Cerberus' })
  title: string;

  @ApiProperty({ example: 'Your account has been successfully created.' })
  message: string;

  @ApiProperty({
    enum: InAppNotificationType,
    example: InAppNotificationType.INFO,
  })
  type: InAppNotificationType;

  @ApiPropertyOptional({ example: { actionUrl: '/dashboard' } })
  data?: Record<string, unknown>;

  @ApiProperty({ example: true })
  isRead: boolean;

  @ApiPropertyOptional({ example: '2026-08-15T22:00:00.000Z' })
  readAt?: Date | null;

  @ApiProperty({ example: '2026-08-15T22:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2026-08-15T22:00:00.000Z' })
  updatedAt?: Date;

  static fromDomain(
    entity: InAppNotification,
  ): MarkNotificationAsReadResponseDto {
    const dto = new MarkNotificationAsReadResponseDto();
    const data = entity.data;
    dto.id = data.id;
    dto.userId = data.userId;
    dto.title = data.title;
    dto.message = data.message;
    dto.type = data.type;
    dto.data = data.metadata;
    dto.isRead = data.isRead;
    dto.readAt = data.readAt;
    dto.createdAt = data.createdAt;
    dto.updatedAt = data.updatedAt;
    return dto;
  }
}
