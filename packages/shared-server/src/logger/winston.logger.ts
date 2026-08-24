import * as path from 'node:path';

import type { AppConfigService } from '@core/config';
import { Injectable, type LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';

import 'winston-daily-rotate-file';
import { RequestContextService } from '../context/request-context.service';
import { sanitizeData } from '../utils/sanitizer.util';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor(private readonly appConfig: AppConfigService) {
    const isProduction = process.env.NODE_ENV === 'production';
    const logDir = this.appConfig.LOG_DIR || 'logs';
    const logLevel = this.appConfig.LOG_LEVEL || 'info';
    const logToFile = this.appConfig.LOG_TO_FILE ?? true;

    const transports: winston.transport[] = [];

    transports.push(
      new winston.transports.Console({
        level: logLevel,
        format: isProduction
          ? winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            )
          : winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              winston.format.colorize({ all: true }),
              winston.format.printf((info) => {
                const timestamp =
                  typeof info.timestamp === 'string' ? info.timestamp : '';
                const level = typeof info.level === 'string' ? info.level : '';
                const messageStr =
                  typeof info.message === 'string'
                    ? info.message
                    : JSON.stringify(info.message);
                const contextStr =
                  typeof info.context === 'string'
                    ? `\x1b[33m[${info.context}]\x1b[0m `
                    : '';
                const traceStr =
                  typeof info.correlationId === 'string'
                    ? `\x1b[36m(corrId: ${info.correlationId})\x1b[0m `
                    : '';
                const userStr =
                  typeof info.userId === 'string'
                    ? `\x1b[35m(user: ${info.userId})\x1b[0m `
                    : '';
                const stackStr =
                  typeof info.stack === 'string' ? `\n${info.stack}` : '';
                return `${timestamp} ${level}: ${contextStr}${traceStr}${userStr}${messageStr}${stackStr}`;
              }),
            ),
      }),
    );

    if (logToFile) {
      transports.push(
        new winston.transports.DailyRotateFile({
          dirname: path.resolve(process.cwd(), logDir),
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: logLevel,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );

      transports.push(
        new winston.transports.DailyRotateFile({
          dirname: path.resolve(process.cwd(), logDir),
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      defaultMeta: { service: this.appConfig.APP_NAME },
      transports,
    });
  }

  private enrichContext(context?: string) {
    const store = RequestContextService.getStore();
    return {
      context,
      correlationId: store?.correlationId,
      userId: store?.userId,
    };
  }

  private formatMessage(message: unknown): string {
    if (typeof message === 'string') {
      return message;
    }
    if (typeof message === 'object' && message !== null) {
      return JSON.stringify(sanitizeData(message));
    }
    return String(message);
  }

  log(message: unknown, context?: string) {
    const enriched = this.enrichContext(context);
    this.logger.info(this.formatMessage(message), enriched);
  }

  error(message: unknown, stack?: string, context?: string) {
    const enriched = this.enrichContext(context);
    this.logger.error(this.formatMessage(message), { ...enriched, stack });
  }

  warn(message: unknown, context?: string) {
    const enriched = this.enrichContext(context);
    this.logger.warn(this.formatMessage(message), enriched);
  }

  debug(message: unknown, context?: string) {
    const enriched = this.enrichContext(context);
    this.logger.debug(this.formatMessage(message), enriched);
  }

  verbose(message: unknown, context?: string) {
    const enriched = this.enrichContext(context);
    this.logger.verbose(this.formatMessage(message), enriched);
  }
}
