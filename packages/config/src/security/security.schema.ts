import Joi from 'joi';

const ONE_MINUTE_IN_MS = 60 * 1000;

export const DEFAULT_THROTTLE_TTL_MS = ONE_MINUTE_IN_MS;
export const DEFAULT_THROTTLE_LIMIT = 100;

export const DEFAULT_THROTTLE_AUTH_TTL_MS = ONE_MINUTE_IN_MS;
export const DEFAULT_THROTTLE_AUTH_LIMIT = 5;

export const DEFAULT_THROTTLE_EMAIL_TTL_MS = ONE_MINUTE_IN_MS;
export const DEFAULT_THROTTLE_EMAIL_LIMIT = 2;

export const securitySchema = {
  CONTENT_SECURITY_POLICY: Joi.boolean().default(false),
  COOKIE_KEY: Joi.string().required(),
  CORS_ORIGINS: Joi.string(),
  CORS_CREDENTIALS: Joi.boolean().default(false),
  CORS_METHODS: Joi.string(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  ENCRYPTION_KEY: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required(),
  GOOGLE_REDIRECT_FRONTEND_URL: Joi.string().default('http://localhost:3000'),
  THROTTLE_TTL: Joi.number().default(DEFAULT_THROTTLE_TTL_MS),
  THROTTLE_LIMIT: Joi.number().default(DEFAULT_THROTTLE_LIMIT),
  THROTTLE_AUTH_TTL: Joi.number().default(DEFAULT_THROTTLE_AUTH_TTL_MS),
  THROTTLE_AUTH_LIMIT: Joi.number().default(DEFAULT_THROTTLE_AUTH_LIMIT),
  THROTTLE_EMAIL_TTL: Joi.number().default(DEFAULT_THROTTLE_EMAIL_TTL_MS),
  THROTTLE_EMAIL_LIMIT: Joi.number().default(DEFAULT_THROTTLE_EMAIL_LIMIT),
};
