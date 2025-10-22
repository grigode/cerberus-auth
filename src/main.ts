import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const config = app.get(AppConfigService);

  await app.register(helmet, {
    contentSecurityPolicy: config.CONTENT_SECURITY_POLICY,
  });

  app.setGlobalPrefix(config.GLOBAL_PREFIX);

  await app.register(cookie, {
    secret: config.COOKIE_KEY,
    parseOptions: {
      httpOnly: true,
      path: '/',
      sameSite: true,
      secure: true,
    },
  });

  app.enableCors({
    origin: config.CORS_ORIGINS,
    credentials: config.CORS_CREDENTIALS,
    methods: config.CORS_METHODS,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(config.PORT);
}

const handleError = (error: unknown) => {
  console.error(error);
  process.exit(1);
};

bootstrap().catch(handleError);

process.on('uncaughtException', handleError);
