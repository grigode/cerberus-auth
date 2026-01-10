import Joi from 'joi';

export const appConfigSchema = {
  APP_NAME: Joi.string().default('Cerberus Auth'),
  PORT: Joi.number().port().default(8000),
  IS_HTTPS: Joi.boolean().default(false),
  HTTPS_KEY_PATH: Joi.string(),
  HTTPS_CERT_PATH: Joi.string(),
};
