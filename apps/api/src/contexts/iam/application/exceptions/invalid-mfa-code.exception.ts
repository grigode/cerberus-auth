import { BadRequestApplicationException } from '@core/shared-server';

export class InvalidMfaCodeException extends BadRequestApplicationException {
  constructor() {
    super(
      'INVALID_MFA_CODE',
      'Invalid or expired multi-factor authentication code',
    );
  }
}
