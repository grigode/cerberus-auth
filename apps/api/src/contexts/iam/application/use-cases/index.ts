import { ChangePasswordUseCase } from './change-password';
import { ConfirmEmailUseCase } from './confirm-email';
import { CreateSessionUseCase } from './create-session';
import { CreateUserUseCase } from './create-user';
import { DeactivateAccountUseCase } from './deactivate-account';
import { DisableMfaUseCase } from './disable-mfa';
import { EmailLoginUseCase } from './email-login';
import { EnableMfaUseCase } from './enable-mfa';
import { ForgotPasswordUseCase } from './forgot-password';
import { GenerateMfaBackupCodesUseCase } from './generate-mfa-backup-codes';
import { GetActiveSessionsUseCase } from './get-active-sessions';
import { GetProfileUseCase } from './get-profile';
import { GoogleLoginUseCase } from './google-login';
import { LogoutUseCase } from './logout';
import { LogoutAllUseCase } from './logout-all';
import { ResendConfirmationEmailUseCase } from './resend-confirm-email';
import { ResetPasswordUseCase } from './reset-password';
import { RevokeSessionUseCase } from './revoke-session';
import { RotateSessionUseCase } from './rotate-session';
import { SetupMfaUseCase } from './setup-mfa';
import { UpdateProfileUseCase } from './update-profile';
import { VerifyMfaUseCase } from './verify-mfa';
import { VerifyMfaBackupCodeUseCase } from './verify-mfa-backup-code';

export * from './change-password';
export * from './confirm-email';
export * from './create-session';
export * from './create-user';
export * from './deactivate-account';
export * from './disable-mfa';
export * from './email-login';
export * from './enable-mfa';
export * from './forgot-password';
export * from './generate-mfa-backup-codes';
export * from './get-active-sessions';
export * from './get-profile';
export * from './google-login';
export * from './logout';
export * from './logout-all';
export * from './resend-confirm-email';
export * from './reset-password';
export * from './revoke-session';
export * from './rotate-session';
export * from './setup-mfa';
export * from './update-profile';
export * from './verify-mfa';
export * from './verify-mfa-backup-code';

export const useCases = [
  ConfirmEmailUseCase,
  CreateSessionUseCase,
  CreateUserUseCase,
  EmailLoginUseCase,
  GoogleLoginUseCase,
  ResendConfirmationEmailUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  RotateSessionUseCase,
  LogoutUseCase,
  GetProfileUseCase,
  UpdateProfileUseCase,
  SetupMfaUseCase,
  EnableMfaUseCase,
  DisableMfaUseCase,
  VerifyMfaUseCase,
  ChangePasswordUseCase,
  LogoutAllUseCase,
  DeactivateAccountUseCase,
  GetActiveSessionsUseCase,
  RevokeSessionUseCase,
  GenerateMfaBackupCodesUseCase,
  VerifyMfaBackupCodeUseCase,
];
