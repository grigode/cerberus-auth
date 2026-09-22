import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import {
  AppConfigService,
  HttpConfigService,
  SecurityConfigService,
} from '@core/config';
import {
  GlobalExceptionFilter,
  WinstonLoggerService,
  getCookieOptions,
} from '@core/shared-server';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const logger = await app.resolve(WinstonLoggerService);
  app.useLogger(logger);

  const appConfig = app.get(AppConfigService);
  const securityConfig = app.get(SecurityConfigService);
  const httpConfig = app.get(HttpConfigService);

  // biome-ignore lint/suspicious/noExplicitAny: Fastify plugin registration typing workaround
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: securityConfig.CONTENT_SECURITY_POLICY,
  });

  // biome-ignore lint/suspicious/noExplicitAny: Fastify plugin registration typing workaround
  await app.register(fastifyMultipart as any);

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

  app.useGlobalFilters(new GlobalExceptionFilter());

  // biome-ignore lint/suspicious/noExplicitAny: Fastify plugin registration typing workaround
  await app.register(fastifyCookie as any, {
    secret: securityConfig.COOKIE_KEY,
    parseOptions: getCookieOptions(appConfig.IS_HTTPS),
  });

  // Swagger OpenAPI Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cerberus Auth API')
    .setDescription(
      'Production-ready authentication and identity management service compliant with OWASP Top 10, NIST SP 800-63B, and OWASP ASVS v4.0.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(appConfig.PORT, '0.0.0.0');
}

const handleError = (error: unknown) => {
  console.error(error);
  process.exit(1);
};

bootstrap().catch(handleError);

process.on('uncaughtException', handleError);
