export interface GenerateMfaBackupCodesDto {
  userId: string;
}

export interface MfaBackupCodesResult {
  backupCodes: string[];
}
