import Joi from 'joi';

export const appSchema = {
  APP_NAME: Joi.string().default('Cerberus Auth'),
  PORT: Joi.number().port().default(8000),
  IS_HTTPS: Joi.boolean().default(false),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  LOG_DIR: Joi.string().default('logs'),
  LOG_TO_FILE: Joi.boolean().default(true),
};
