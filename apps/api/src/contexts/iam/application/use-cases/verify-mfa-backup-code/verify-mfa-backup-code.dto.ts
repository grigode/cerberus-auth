export interface VerifyMfaBackupCodeDto {
  mfaToken: string;
  code: string;
  userAgent?: string;
  ipAddress?: string;
}
