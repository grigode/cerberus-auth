export class ApplicationException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = 'APPLICATION_ERROR',
    public readonly technicalMessage?: string,
  ) {
    super(message);
  }
}
