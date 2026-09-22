import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailLoginResponseDto {
  @ApiProperty({ example: 'Authentication successful' })
  message: string;

  @ApiPropertyOptional({ example: false })
  mfaRequired?: boolean;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  mfaToken?: string;
}
