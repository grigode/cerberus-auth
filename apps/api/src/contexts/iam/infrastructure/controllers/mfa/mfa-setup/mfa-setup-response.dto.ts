import { ApiProperty } from '@nestjs/swagger';

export class MfaSetupResponseDto {
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP' })
  secret: string;

  @ApiProperty({
    example:
      'otpauth://totp/Arachne:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Arachne',
  })
  qrCodeUrl: string;
}
