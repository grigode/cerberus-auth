import { ConfigModule } from '@core/config';
import { Global, Module } from '@nestjs/common';

import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { WinstonLoggerService } from './winston.logger';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [WinstonLoggerService, HttpLoggingInterceptor],
  exports: [WinstonLoggerService, HttpLoggingInterceptor],
})
export class LoggerModule {}
