import {
  ConfirmEmailController,
  EmailLoginController,
  GoogleAuthCallbackController,
  GoogleAuthRedirectController,
  LogoutAllController,
  LogoutController,
  RefreshTokenController,
  RegisterUserController,
  ResendConfirmEmailController,
} from './auth';
import {
  GenerateMfaBackupCodesController,
  MfaDisableController,
  MfaEnableController,
  MfaSetupController,
  MfaVerifyController,
  VerifyMfaBackupCodeController,
} from './mfa';
import {
  ChangePasswordController,
  ForgotPasswordController,
  ResetPasswordController,
} from './password';
import {
  DeactivateAccountController,
  GetProfileController,
  UpdateProfileController,
} from './profile';
import {
  GetActiveSessionsController,
  RevokeSessionController,
} from './sessions';

export * from './auth';
export * from './mfa';
export * from './password';
export * from './profile';
export * from './sessions';

export const controllers = [
  ConfirmEmailController,
  EmailLoginController,
  RegisterUserController,
  ResendConfirmEmailController,
  ForgotPasswordController,
  ResetPasswordController,
  GoogleAuthRedirectController,
  GoogleAuthCallbackController,
  RefreshTokenController,
  LogoutController,
  GetProfileController,
  UpdateProfileController,
  MfaSetupController,
  MfaEnableController,
  MfaDisableController,
  MfaVerifyController,
  GenerateMfaBackupCodesController,
  VerifyMfaBackupCodeController,
  ChangePasswordController,
  LogoutAllController,
  DeactivateAccountController,
  GetActiveSessionsController,
  RevokeSessionController,
];
