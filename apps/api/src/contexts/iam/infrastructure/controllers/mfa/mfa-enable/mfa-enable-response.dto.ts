import { ApiProperty } from '@nestjs/swagger';

export class MfaEnableResponseDto {
  @ApiProperty({ example: 'MFA enabled successfully' })
  message: string;
}
