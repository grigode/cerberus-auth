import { BadRequestApplicationException } from '@core/shared-server';

export class InvalidRefreshTokenException extends BadRequestApplicationException {
  constructor() {
    super(
      'INVALID_REFRESH_TOKEN',
      'Refresh token is invalid, expired, or revoked',
    );
  }
}
