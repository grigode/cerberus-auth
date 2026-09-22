import { BadRequestApplicationException } from '@core/shared-server';

export class PasswordIsRequiredException extends BadRequestApplicationException {
  constructor() {
    super(
      'PASSWORD_IS_REQUIRED',
      'Password is required for credentials authentication',
    );
  }
}
