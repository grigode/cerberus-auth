import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import {
  AppConfigService,
  SecurityConfigService,
  HttpConfigService,
} from './config';
import { createFastifyAdapter, getCookieOptions } from './helpers';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    createFastifyAdapter(),
  );

  const appConfig = app.get(AppConfigService);
  const securityConfig = app.get(SecurityConfigService);
  const httpConfig = app.get(HttpConfigService);

  await app.register(helmet, {
    contentSecurityPolicy: securityConfig.CONTENT_SECURITY_POLICY,
  });

  app.setGlobalPrefix(httpConfig.GLOBAL_PREFIX);

  app.enableCors({
    origin: securityConfig.CORS_ORIGINS,
    credentials: securityConfig.CORS_CREDENTIALS,
    methods: securityConfig.CORS_METHODS,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.register(cookie, {
    secret: securityConfig.COOKIE_KEY,
    parseOptions: getCookieOptions(appConfig.IS_HTTPS),
  });

  await app.listen(appConfig.PORT);
}

const handleError = (error: unknown) => {
  console.error(error);
  process.exit(1);
};

bootstrap().catch(handleError);

process.on('uncaughtException', handleError);
