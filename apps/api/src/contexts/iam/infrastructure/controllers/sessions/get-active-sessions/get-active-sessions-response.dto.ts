import { ApiProperty } from '@nestjs/swagger';

export class UserSessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ description: 'User agent string', required: false })
  userAgent?: string;

  @ApiProperty({ description: 'IP address', required: false })
  ipAddress?: string;

  @ApiProperty({ description: 'Session creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Session expiration timestamp' })
  expiresAt: Date;

  @ApiProperty({ description: 'Last active timestamp', required: false })
  lastUsedAt?: Date;

  @ApiProperty({
    description:
      'True if this session corresponds to the current request token',
  })
  isCurrent: boolean;
}
