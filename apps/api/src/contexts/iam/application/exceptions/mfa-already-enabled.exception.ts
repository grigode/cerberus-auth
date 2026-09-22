import { ConflictApplicationException } from '@core/shared-server';

export class MfaAlreadyEnabledException extends ConflictApplicationException {
  constructor() {
    super(
      'MFA_ALREADY_ENABLED',
      'Multi-factor authentication is already enabled for this account',
    );
  }
}
