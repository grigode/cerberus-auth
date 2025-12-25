import {
  LoginAttemptIdVo,
  LoginAttemptEmailVo,
  LoginAttemptSuccessVo,
  LoginAttemptIpAddressVo,
  LoginAttemptUserAgentVo,
  LoginAttemptFailureReason,
  LoginAttemptAttemptedAtVo,
} from './value-objects';

export interface LoginAttemptI {
  id: LoginAttemptIdVo;
  email: LoginAttemptEmailVo;
  success: LoginAttemptSuccessVo;
  ipAddress: LoginAttemptIpAddressVo;
  userAgent: LoginAttemptUserAgentVo;
  failureReasons: LoginAttemptFailureReason | null;
  attemptedAt: LoginAttemptAttemptedAtVo;
}

export type LoginAttemptCreateI = Omit<LoginAttemptI, 'id' | 'attemptedAt'>;

export interface LoginAttemptPrimitives {
  id: string;
  email: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  failureReasons: string | null;
  attemptedAt: Date;
}

export class LoginAttempt implements LoginAttemptI {
  id: LoginAttemptIdVo;
  email: LoginAttemptEmailVo;
  success: LoginAttemptSuccessVo;
  ipAddress: LoginAttemptIpAddressVo;
  userAgent: LoginAttemptUserAgentVo;
  failureReasons: LoginAttemptFailureReason | null;
  attemptedAt: LoginAttemptAttemptedAtVo;

  constructor(attr: LoginAttemptI) {
    this.id = attr.id;
    this.email = attr.email;
    this.success = attr.success;
    this.ipAddress = attr.ipAddress;
    this.userAgent = attr.userAgent;
    this.failureReasons = attr.failureReasons;
    this.attemptedAt = attr.attemptedAt;
  }

  static create(attr: LoginAttemptCreateI): LoginAttempt {
    return new LoginAttempt({
      ...attr,
      id: LoginAttemptIdVo.generate(),
      attemptedAt: LoginAttemptAttemptedAtVo.now(),
    });
  }

  toPrimitives(): LoginAttemptPrimitives {
    return {
      id: this.id.value,
      email: this.email.value,
      success: this.success.value,
      ipAddress: this.ipAddress.value,
      userAgent: this.userAgent.value,
      failureReasons: this.failureReasons?.value ?? null,
      attemptedAt: this.attemptedAt.value,
    };
  }
}
