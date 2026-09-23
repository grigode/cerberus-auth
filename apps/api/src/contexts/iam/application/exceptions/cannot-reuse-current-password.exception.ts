import { BadRequestApplicationException } from '@core/shared-server';

export class CannotReuseCurrentPasswordException extends BadRequestApplicationException {
  constructor() {
    super(
      'CANNOT_REUSE_CURRENT_PASSWORD',
      'The new password cannot be the same as the current password',
    );
  }
}
