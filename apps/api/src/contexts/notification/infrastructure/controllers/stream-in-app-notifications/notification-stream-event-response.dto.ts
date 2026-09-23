import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationStreamEventResponseDto {
  @ApiPropertyOptional({
    example: 'notification',
    description: 'Event type ("notification" or "ping")',
  })
  type?: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Welcome',
      message: 'Hello World',
    },
    description: 'Event payload or ping timestamp data',
  })
  data: Record<string, unknown> | string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id?: string;

  @ApiPropertyOptional({ example: 10000 })
  retry?: number;
}
