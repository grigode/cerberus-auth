export class BaseException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly technicalMessage?: string; // For logs

  constructor(code: string, statusCode = 500, technicalMessage?: string) {
    super(technicalMessage || code);

    this.code = code;
    this.statusCode = statusCode;
    this.technicalMessage = technicalMessage;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends BaseException {
  constructor(code = 'BAD_REQUEST', technicalMessage?: string) {
    super(code, 400, technicalMessage);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(code = 'UNAUTHORIZED', technicalMessage?: string) {
    super(code, 401, technicalMessage);
  }
}

export class ForbiddenException extends BaseException {
  constructor(code = 'FORBIDDEN', technicalMessage?: string) {
    super(code, 403, technicalMessage);
  }
}

export class NotFoundException extends BaseException {
  constructor(code = 'NOT_FOUND', technicalMessage?: string) {
    super(code, 404, technicalMessage);
  }
}

export class ConflictException extends BaseException {
  constructor(code = 'CONFLICT', technicalMessage?: string) {
    super(code, 409, technicalMessage);
  }
}

export class InternalServerErrorException extends BaseException {
  constructor(code = 'INTERNAL_SERVER_ERROR', technicalMessage?: string) {
    super(code, 500, technicalMessage);
  }
}
