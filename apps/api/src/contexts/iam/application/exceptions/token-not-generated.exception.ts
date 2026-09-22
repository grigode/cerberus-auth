import { InternalServerErrorApplicationException } from '@core/shared-server';

export class TokenNotGeneratedException extends InternalServerErrorApplicationException {
  constructor() {
    super('TOKEN_NOT_GENERATED', 'Failed to generate authentication token');
  }
}
