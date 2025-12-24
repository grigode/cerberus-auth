import { HttpErrorException } from './http-error';

export class NotFoundError extends HttpErrorException {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}
