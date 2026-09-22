import { BadRequestApplicationException } from '@core/shared-server';

export class InvalidResetTokenException extends BadRequestApplicationException {
  constructor() {
    super('INVALID_RESET_TOKEN', 'Password reset token is invalid or expired');
  }
}
