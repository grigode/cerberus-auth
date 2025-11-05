import { Injectable, LoggerService } from '@nestjs/common';
import winston from 'winston';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.cli(),
        }),
      ],
    });
  }

  log(message: string, ...optionalParams: any[]) {
    this.logger.info(message, optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    this.logger.error(message, optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    this.logger.warn(message, optionalParams);
  }

  debug(message: string, ...optionalParams: any[]) {
    this.logger.debug(message, optionalParams);
  }

  verbose(message: string, ...optionalParams: any[]) {
    this.logger.verbose(message, optionalParams);
  }
}
