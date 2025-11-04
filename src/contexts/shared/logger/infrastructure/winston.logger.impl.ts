import { Injectable } from '@nestjs/common';
import winston from 'winston';

import { Context, Logger, Message } from '../domain';

@Injectable()
export class WinstonLoggerService implements Logger {
  logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    });
  }

  debug(message: Message, context?: Context): void {
    this.logger.debug(message, context);
  }

  info(message: Message, context?: Context): void {
    this.logger.info(message, context);
  }

  warm(message: Message, context?: Context): void {
    this.logger.warn(message, context);
  }

  error(message: Message, context?: Context): void {
    this.logger.error(message, context);
  }
}
