import Joi from 'joi';

export const appConfigSchema = {
  APP_NAME: Joi.string().default('Cerberus Auth'),
  PORT: Joi.number().port().default(8000),
};
