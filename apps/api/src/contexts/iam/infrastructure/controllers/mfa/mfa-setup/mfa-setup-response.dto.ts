import { ApiProperty } from '@nestjs/swagger';

export class MfaSetupResponseDto {
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP' })
  secret: string;

  @ApiProperty({
    example:
      'otpauth://totp/Cerberus:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Cerberus',
  })
  qrCodeUrl: string;
}
