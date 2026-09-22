import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class MfaEnableDto {
  @ApiProperty({
    description: 'Base32 plain TOTP secret key generated from /iam/mfa/setup',
    example: 'JBSWY3DPEHPK3PXP',
  })
  @IsString()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({
    description: '6-digit TOTP verification code from authenticator app',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
