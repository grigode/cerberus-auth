import { ApiProperty } from '@nestjs/swagger';

export class MfaVerifyResponseDto {
  @ApiProperty({ example: 'MFA verified successfully' })
  message: string;
}
