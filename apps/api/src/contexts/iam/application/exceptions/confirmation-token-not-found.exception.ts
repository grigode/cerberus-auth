import { NotFoundApplicationException } from '@core/shared-server';

export class ConfirmationTokenNotFoundException extends NotFoundApplicationException {
  constructor(token: string) {
    super(
      'CONFIRMATION_TOKEN_NOT_FOUND',
      `Confirmation token '${token}' not found`,
    );
  }
}
