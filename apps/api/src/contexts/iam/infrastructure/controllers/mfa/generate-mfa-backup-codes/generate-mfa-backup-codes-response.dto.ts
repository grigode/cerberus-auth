import { ApiProperty } from '@nestjs/swagger';

export class MfaBackupCodesResponseDto {
  @ApiProperty({
    description: 'List of single-use emergency MFA backup codes',
    example: ['A1B2C3D4E5', 'F6G7H8I9J0'],
  })
  backupCodes: string[];
}
