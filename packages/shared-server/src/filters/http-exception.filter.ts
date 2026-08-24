import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { DomainException } from '@core/domain';
import { RequestContextService } from '../context/request-context.service';
import { ApplicationException } from '../exceptions/application.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const correlationId = RequestContextService.getStore()?.correlationId;

    // NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .send(exception.getResponse());
    }

    // Application exceptions
    if (exception instanceof ApplicationException) {
      this.logger.warn(
        `ApplicationException: ${exception.code} - ${exception.technicalMessage || exception.message}`,
        `${request.method} ${request.url}`,
      );

      return response.status(exception.statusCode).send({
        statusCode: exception.statusCode,
        code: exception.code,
        message: exception.message,
        correlationId,
      });
    }

    // Domain exceptions
    if (exception instanceof DomainException) {
      this.logger.error(
        `DomainException: ${exception.message}`,
        exception.stack,
        `${request.method} ${request.url}`,
      );

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        correlationId,
      });
    }

    // Unknown errors
    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    this.logger.error(
      `Unhandled exception: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
      `${request.method} ${request.url}`,
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      correlationId,
    });
  }
}
