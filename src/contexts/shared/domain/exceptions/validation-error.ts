import { HttpErrorException } from './http-error';

export class ValidationError extends HttpErrorException {
  constructor(message: string = 'Validation error') {
    super(message, 400);
  }
}
