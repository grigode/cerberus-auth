import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDetailsDto {
  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'en' })
  language?: string;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'USER' })
  role: string;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;

  @ApiProperty({ example: false })
  isMfaEnabled: boolean;

  @ApiProperty({ type: UserProfileDetailsDto })
  profile: UserProfileDetailsDto;

  @ApiProperty({ example: ['EMAIL'] })
  providers: string[];
}
