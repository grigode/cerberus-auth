import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validationSchema } from './validation.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      cache: true,
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: validationSchema,
    }),
  ],
})
export class ConfigModule {}
