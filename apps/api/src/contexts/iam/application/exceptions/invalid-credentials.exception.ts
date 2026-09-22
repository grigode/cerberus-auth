import { BadRequestApplicationException } from '@core/shared-server';

export class InvalidCredentialsException extends BadRequestApplicationException {
  constructor(customMessage?: string) {
    super(
      'INVALID_CREDENTIALS',
      customMessage ?? 'Invalid email or password credentials',
    );
  }
}
