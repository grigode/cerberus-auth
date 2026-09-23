import { BadRequestApplicationException } from '@core/shared-server';

export class InvalidMfaCodeException extends BadRequestApplicationException {
  constructor(message = 'Invalid or expired multi-factor authentication code') {
    super('INVALID_MFA_CODE', message);
  }
}
