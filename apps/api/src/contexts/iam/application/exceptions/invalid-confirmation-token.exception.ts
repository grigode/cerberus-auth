import { BadRequestApplicationException } from '@core/shared-server';

export class InvalidConfirmationTokenException extends BadRequestApplicationException {
  constructor() {
    super(
      'INVALID_CONFIRMATION_TOKEN',
      'Confirmation token is invalid or expired',
    );
  }
}
