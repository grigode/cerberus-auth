import { ForbiddenApplicationException } from '@core/shared-server';

export class UserInactiveException extends ForbiddenApplicationException {
  constructor(email: string) {
    super(
      'USER_INACTIVE',
      `User account '${email}' is inactive or deactivated.`,
    );
  }
}
