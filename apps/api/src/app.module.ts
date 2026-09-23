import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { ConfigModule, SecurityConfigService } from '@core/config';
import { DatabaseModule } from '@core/database';
import {
  CustomThrottlerGuard,
  HealthController,
  HttpLoggingInterceptor,
  LoggerModule,
  RequestContextMiddleware,
} from '@core/shared-server';

import { AuditModule } from './contexts/audit';
import { IamModule } from './contexts/iam';
import {
  AuthGuard,
  AuthMiddleware,
  RolesGuard,
} from './contexts/iam/infrastructure';
import { NotificationModule } from './contexts/notification';
import { StorageModule } from './contexts/storage';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    AuditModule,
    StorageModule,
    IamModule,
    NotificationModule,

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [SecurityConfigService],
      useFactory: (securityConfig: SecurityConfigService) => [
        {
          name: 'default',
          ttl: securityConfig.THROTTLE_TTL,
          limit: securityConfig.THROTTLE_LIMIT,
        },
        {
          name: 'auth',
          ttl: securityConfig.THROTTLE_AUTH_TTL,
          limit: securityConfig.THROTTLE_AUTH_LIMIT,
        },
        {
          name: 'email',
          ttl: securityConfig.THROTTLE_EMAIL_TTL,
          limit: securityConfig.THROTTLE_EMAIL_LIMIT,
        },
      ],
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, AuthMiddleware)
      .forRoutes('{*path}');
  }
}
