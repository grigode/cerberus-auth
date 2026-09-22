import { ForbiddenApplicationException } from '@core/shared-server';

export class EmailNotVerifiedException extends ForbiddenApplicationException {
  constructor(email: string) {
    super(
      'EMAIL_NOT_VERIFIED',
      `Email '${email}' is not verified. Please verify your email first.`,
    );
  }
}
