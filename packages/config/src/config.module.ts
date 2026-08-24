import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validationSchema } from './validation.schema';
import { providers } from './providers.constants';

@Module({
  imports: [
    NestConfigModule.forRoot({
      cache: true,
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      validationSchema: validationSchema,
    }),
  ],
  providers,
  exports: providers,
})
export class ConfigModule {}
