import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyMfaBackupCodeRequestDto {
  @ApiProperty({
    description: 'Temporary MFA token issued during initial login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  mfaToken: string;

  @ApiProperty({
    description: '10-character single-use emergency backup code',
    example: 'A1B2C3D4E5',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
