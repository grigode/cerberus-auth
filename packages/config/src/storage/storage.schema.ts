import Joi from 'joi';

export const storageSchema = {
  STORAGE_S3_ENDPOINT: Joi.string().allow('').default('http://localhost:9000'),
  STORAGE_S3_REGION: Joi.string().default('us-east-1'),
  STORAGE_S3_BUCKET: Joi.string().default('cerberus-uploads'),
  STORAGE_S3_ACCESS_KEY_ID: Joi.string().allow('').default('minioadmin'),
  STORAGE_S3_SECRET_ACCESS_KEY: Joi.string().allow('').default('minioadmin'),
  STORAGE_S3_FORCE_PATH_STYLE: Joi.boolean().default(true),
  STORAGE_S3_URL_EXPIRATION_SECONDS: Joi.number().positive().default(3600),
  STORAGE_S3_PUBLIC_URL: Joi.string().allow('').default(''),
};
