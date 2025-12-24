import { HttpErrorException } from './http-error';

export class InternalServerError extends HttpErrorException {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}
