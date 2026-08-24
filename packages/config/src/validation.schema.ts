import Joi from 'joi';
import { appSchema } from './app';
import { databaseSchema } from './database';
import { mailSchema } from './mail';
import { redisSchema } from './redis';
import { securitySchema } from './security';

export const validationSchema = Joi.object({
  ...appSchema,
  ...databaseSchema,
  ...mailSchema,
  ...redisSchema,
  ...securitySchema,
});
