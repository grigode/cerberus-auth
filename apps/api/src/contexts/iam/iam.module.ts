import { Module } from '@nestjs/common';
import { AppConfigService, ConfigModule, JwtModule } from '@core/config';
import { DatabaseModule } from '@core/database';

import { useCases } from './application';
import {
  CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN,
  PASSWORD_RESET_TOKEN_DRIVEN_PORT_TOKEN,
  PROFILE_DRIVEN_PORT_TOKEN,
  REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
  USER_DRIVEN_PORT_TOKEN,
} from '@core/domain';
import {
  ConfirmationTokenTypeormAdapter,
  controllers,
  ProfileDrivenTypeormAdapter,
  UserDrivenTypeormAdapter,
  RefreshTokenTypeormAdapter,
  PasswordResetTokenTypeormAdapter,
  AuthMiddleware,
  AuthGuard,
} from './infrastructure';
import { NotificationModule } from '../notification/notification.module';
import {
  ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
  ENCRYPTION_DRIVEN_PORT_TOKEN,
  HASHING_DRIVEN_PORT_TOKEN,
} from '@core/domain';
import {
  AccessTokenDrivenAdapter,
  Argon2HashingAdapter,
  CryptoDrivenAdapter,
} from '@core/shared-server';

@Module({
  imports: [DatabaseModule, JwtModule, ConfigModule, NotificationModule],
  controllers: [...controllers],
  providers: [
    AppConfigService,
    AuthMiddleware,
    AuthGuard,
    { provide: USER_DRIVEN_PORT_TOKEN, useClass: UserDrivenTypeormAdapter },
    {
      provide: PROFILE_DRIVEN_PORT_TOKEN,
      useClass: ProfileDrivenTypeormAdapter,
    },
    {
      provide: CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN,
      useClass: ConfirmationTokenTypeormAdapter,
    },
    {
      provide: REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
      useClass: RefreshTokenTypeormAdapter,
    },
    {
      provide: PASSWORD_RESET_TOKEN_DRIVEN_PORT_TOKEN,
      useClass: PasswordResetTokenTypeormAdapter,
    },
    {
      provide: ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
      useClass: AccessTokenDrivenAdapter,
    },
    {
      provide: ENCRYPTION_DRIVEN_PORT_TOKEN,
      useClass: CryptoDrivenAdapter,
    },
    {
      provide: HASHING_DRIVEN_PORT_TOKEN,
      useClass: Argon2HashingAdapter,
    },
    ...useCases,
  ],
  exports: [
    AuthMiddleware,
    AuthGuard,
    ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
    USER_DRIVEN_PORT_TOKEN,
    PROFILE_DRIVEN_PORT_TOKEN,
    CONFIRMATION_TOKEN_DRIVEN_PORT_TOKEN,
    REFRESH_TOKEN_DRIVEN_PORT_TOKEN,
    PASSWORD_RESET_TOKEN_DRIVEN_PORT_TOKEN,
    HASHING_DRIVEN_PORT_TOKEN,
    ...useCases,
  ],
})
export class IamModule {}
