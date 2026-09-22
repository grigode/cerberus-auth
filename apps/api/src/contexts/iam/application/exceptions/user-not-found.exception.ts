import { NotFoundApplicationException } from '@core/shared-server';

export class UserNotFoundException extends NotFoundApplicationException {
  constructor(id: string) {
    super('USER_NOT_FOUND', `User with id '${id}' not found`);
  }
}
