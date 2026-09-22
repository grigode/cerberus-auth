import { BadRequestApplicationException } from '@core/shared-server';

export class MfaNotEnabledException extends BadRequestApplicationException {
  constructor() {
    super(
      'MFA_NOT_ENABLED',
      'Multi-factor authentication is not enabled for this account',
    );
  }
}
