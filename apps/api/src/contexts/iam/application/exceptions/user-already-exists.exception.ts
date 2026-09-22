import { ConflictApplicationException } from '@core/shared-server';

export class UserAlreadyExistsException extends ConflictApplicationException {
  constructor(email: string) {
    super('USER_ALREADY_EXISTS', `User with email '${email}' already exists`);
  }
}
