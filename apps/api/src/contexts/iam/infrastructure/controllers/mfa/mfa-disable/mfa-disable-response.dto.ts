import { ApiProperty } from '@nestjs/swagger';

export class MfaDisableResponseDto {
  @ApiProperty({ example: 'MFA disabled successfully' })
  message: string;
}
