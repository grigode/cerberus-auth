// ----------------------------------------------------
// Two-Factor Authentication (MFA) Contracts
// ----------------------------------------------------

export interface MfaSetupResponseDto {
  secret: string;
  qrCodeUrl: string;
}

export interface MfaEnableRequestDto {
  code: string;
  secret?: string;
}

export interface MfaEnableResponseDto {
  message: string;
  backupCodes: string[];
}

export interface MfaDisableRequestDto {
  code: string;
}

export interface MfaDisableResponseDto {
  message: string;
}

export interface MfaVerifyRequestDto {
  mfaToken: string;
  code: string;
}

export interface MfaVerifyBackupCodeRequestDto {
  mfaToken: string;
  code: string;
}

export interface GenerateBackupCodesResponseDto {
  backupCodes: string[];
}
