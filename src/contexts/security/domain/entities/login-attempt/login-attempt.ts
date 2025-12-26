import {
  LoginAttemptIdVo,
  LoginAttemptEmailVo,
  LoginAttemptResultVo,
  LoginAttemptIpAddressVo,
  LoginAttemptUserAgentVo,
  LoginAttemptFailureReason,
  LoginAttemptedAtVo,
} from './value-objects';

export interface LoginAttemptProps {
  id: LoginAttemptIdVo;
  email: LoginAttemptEmailVo;
  result: LoginAttemptResultVo;
  ipAddress: LoginAttemptIpAddressVo;
  userAgent: LoginAttemptUserAgentVo;
  failureReason: LoginAttemptFailureReason | null;
  attemptedAt: LoginAttemptedAtVo;
}

export type LoginAttemptCreateProps = Omit<
  LoginAttemptProps,
  'id' | 'attemptedAt'
>;

export interface LoginAttemptPrimitives {
  id: string;
  email: string;
  result: boolean;
  ipAddress: string;
  userAgent: string;
  failureReason: string | null;
  attemptedAt: Date;
}

export class LoginAttempt implements LoginAttemptProps {
  id: LoginAttemptIdVo;
  email: LoginAttemptEmailVo;
  result: LoginAttemptResultVo;
  ipAddress: LoginAttemptIpAddressVo;
  userAgent: LoginAttemptUserAgentVo;
  failureReason: LoginAttemptFailureReason | null;
  attemptedAt: LoginAttemptedAtVo;

  constructor(attr: LoginAttemptProps) {
    this.id = attr.id;
    this.email = attr.email;
    this.result = attr.result;
    this.ipAddress = attr.ipAddress;
    this.userAgent = attr.userAgent;
    this.failureReason = attr.failureReason;
    this.attemptedAt = attr.attemptedAt;
  }

  static create(attr: LoginAttemptCreateProps): LoginAttempt {
    return new LoginAttempt({
      ...attr,
      id: LoginAttemptIdVo.generate(),
      attemptedAt: LoginAttemptedAtVo.now(),
    });
  }

  toPrimitives(): LoginAttemptPrimitives {
    return {
      id: this.id.value,
      email: this.email.value,
      result: this.result.value,
      ipAddress: this.ipAddress.value,
      userAgent: this.userAgent.value,
      failureReason: this.failureReason?.value ?? null,
      attemptedAt: this.attemptedAt.value,
    };
  }
}
