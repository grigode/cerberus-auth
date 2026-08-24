import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();
    const response = httpContext.getResponse<FastifyReply>();

    const method = request.method;
    const url = request.url;
    const startTime = RequestContextService.getStore()?.startTime || Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 200;
          this.logger.log(`${method} ${url} ${statusCode} - ${duration}ms`);
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const errObj = error as {
            status?: number;
            statusCode?: number;
            message?: string;
          };
          const statusCode = errObj.status || errObj.statusCode || 500;
          const errMsg = errObj.message || String(error);
          this.logger.warn(
            `${method} ${url} ${statusCode} - ${duration}ms [Error: ${errMsg}]`,
          );
        },
      }),
    );
  }
}
