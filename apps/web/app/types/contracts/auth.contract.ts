import type { ProviderVo, RoleVo } from '@core/domain';

export type UserRole = `${RoleVo}`;
export type AuthProvider = `${ProviderVo}`;

// ----------------------------------------------------
// Authentication Contracts
// ----------------------------------------------------

export interface EmailLoginRequestDto {
  email: string;
  password: string;
}

export interface EmailLoginResponseDto {
  message: string;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface RegisterUserRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterUserResponseDto {
  message: string;
  id?: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  password: string;
}

export interface ResetPasswordResponseDto {
  message: string;
}

export interface ResendConfirmEmailRequestDto {
  email: string;
}

export interface ResendConfirmEmailResponseDto {
  message: string;
}

export interface ConfirmEmailRequestDto {
  token: string;
}

export interface ConfirmEmailResponseDto {
  message: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponseDto {
  message: string;
}
