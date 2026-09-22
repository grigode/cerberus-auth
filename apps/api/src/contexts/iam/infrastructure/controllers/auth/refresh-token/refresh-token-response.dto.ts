import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
  @ApiProperty({ example: 'Tokens rotated successfully' })
  message: string;
}
