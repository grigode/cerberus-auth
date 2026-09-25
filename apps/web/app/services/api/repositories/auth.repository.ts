import type {
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
  ConfirmEmailResponseDto,
  EmailLoginRequestDto,
  EmailLoginResponseDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
  ResendConfirmEmailRequestDto,
  ResendConfirmEmailResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
} from '~/types/contracts';
import { BaseRepository } from './base.repository';

export interface IAuthRepository {
  login(payload: EmailLoginRequestDto): Promise<EmailLoginResponseDto>;
  register(payload: RegisterUserRequestDto): Promise<RegisterUserResponseDto>;
  confirmEmail(token: string): Promise<ConfirmEmailResponseDto>;
  resendConfirmEmail(
    payload: ResendConfirmEmailRequestDto,
  ): Promise<ResendConfirmEmailResponseDto>;
  forgotPassword(
    payload: ForgotPasswordRequestDto,
  ): Promise<ForgotPasswordResponseDto>;
  resetPassword(
    payload: ResetPasswordRequestDto,
  ): Promise<ResetPasswordResponseDto>;
  changePassword(
    payload: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto>;
  refreshToken(): Promise<boolean>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
}

export class AuthRepository extends BaseRepository implements IAuthRepository {
  login(payload: EmailLoginRequestDto): Promise<EmailLoginResponseDto> {
    return this.post<EmailLoginResponseDto>('/iam/login', payload);
  }

  register(payload: RegisterUserRequestDto): Promise<RegisterUserResponseDto> {
    return this.post<RegisterUserResponseDto>('/iam/register-user', payload);
  }

  confirmEmail(token: string): Promise<ConfirmEmailResponseDto> {
    return this.get<ConfirmEmailResponseDto>('/iam/confirm-email', {
      query: { token },
    });
  }

  resendConfirmEmail(
    payload: ResendConfirmEmailRequestDto,
  ): Promise<ResendConfirmEmailResponseDto> {
    return this.post<ResendConfirmEmailResponseDto>(
      '/iam/resend-confirm-email',
      payload,
    );
  }

  forgotPassword(
    payload: ForgotPasswordRequestDto,
  ): Promise<ForgotPasswordResponseDto> {
    return this.post<ForgotPasswordResponseDto>(
      '/iam/forgot-password',
      payload,
    );
  }

  resetPassword(
    payload: ResetPasswordRequestDto,
  ): Promise<ResetPasswordResponseDto> {
    return this.post<ResetPasswordResponseDto>('/iam/reset-password', payload);
  }

  changePassword(
    payload: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    return this.post<ChangePasswordResponseDto>(
      '/iam/auth/change-password',
      payload,
    );
  }

  async refreshToken(): Promise<boolean> {
    try {
      await this.post('/iam/refresh-token');
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await this.post('/iam/logout');
  }

  async logoutAll(): Promise<void> {
    await this.post('/iam/auth/logout-all');
  }
}
