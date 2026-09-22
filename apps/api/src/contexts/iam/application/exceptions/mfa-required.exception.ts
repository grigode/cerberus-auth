import { UnauthorizedApplicationException } from '@core/shared-server';

export class MfaRequiredException extends UnauthorizedApplicationException {
  constructor(mfaToken: string) {
    super('MFA_REQUIRED', `MFA verification required. Token: ${mfaToken}`);
  }
}
