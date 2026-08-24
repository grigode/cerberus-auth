import Joi from 'joi';

export const mailSchema = {
  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().port().default(1025),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_FROM_NAME: Joi.string().default('Cerberus Auth'),
  SMTP_FROM_EMAIL: Joi.string().email().default('no-reply@cerberus-auth.com'),
};
