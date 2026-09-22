import { ConflictApplicationException } from '@core/shared-server';

export class UserAlreadyConfirmedException extends ConflictApplicationException {
  constructor(email: string) {
    super(
      'USER_ALREADY_CONFIRMED',
      `User with email '${email}' is already confirmed`,
    );
  }
}
