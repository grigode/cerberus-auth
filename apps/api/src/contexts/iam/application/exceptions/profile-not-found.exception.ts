import { NotFoundApplicationException } from '@core/shared-server';

export class ProfileNotFoundException extends NotFoundApplicationException {
  constructor(userId: string) {
    super('PROFILE_NOT_FOUND', `Profile for user id '${userId}' not found`);
  }
}
