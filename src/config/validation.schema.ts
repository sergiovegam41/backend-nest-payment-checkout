import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Application Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  APP_PORT: Joi.number()
    .port()
    .default(3000),
  
  APP_URL: Joi.string()
    .uri()
    .default('http://localhost:3000')
    .messages({
      'string.uri': 'APP_URL must be a valid URL',
    }),

  // Database Configuration
  DB_HOST: Joi.string()
    .hostname()
    .required()
    .messages({
      'any.required': 'DB_HOST is required',
    }),

  DB_PORT: Joi.number()
    .port()
    .default(5432),

  DB_USER: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'DB_USER is required',
      'string.min': 'DB_USER cannot be empty',
    }),

  DB_PASSWORD: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'DB_PASSWORD is required',
      'string.min': 'DB_PASSWORD cannot be empty',
    }),

  DB_NAME: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'DB_NAME is required',
      'string.min': 'DB_NAME cannot be empty',
    }),

  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required()
    .messages({
      'string.uri': 'DATABASE_URL must be a valid PostgreSQL connection string',
      'any.required': 'DATABASE_URL is required',
    }),

  // Wompi Configuration
  WOMPI_UAT_URL: Joi.string()
    .uri()
    .default('https://api.co.uat.wompi.dev/v1')
    .messages({
      'string.uri': 'WOMPI_UAT_URL must be a valid URL',
    }),

  WOMPI_SANDBOX_URL: Joi.string()
    .uri()
    .default('https://api-sandbox.co.uat.wompi.dev/v1')
    .messages({
      'string.uri': 'WOMPI_SANDBOX_URL must be a valid URL',
    }),

  WOMPI_PUBLIC_KEY: Joi.string()
    .required()
    .messages({
      'any.required': 'WOMPI_PUBLIC_KEY is required',
    }),

  WOMPI_PRIVATE_KEY: Joi.string()
    .required()
    .messages({
      'any.required': 'WOMPI_PRIVATE_KEY is required',
    }),

  WOMPI_EVENTS_KEY: Joi.string()
    .required()
    .messages({
      'any.required': 'WOMPI_EVENTS_KEY is required',
    }),

  WOMPI_INTEGRITY_KEY: Joi.string()
    .required()
    .messages({
      'any.required': 'WOMPI_INTEGRITY_KEY is required',
    }),

  WOMPI_ENVIRONMENT: Joi.string()
    .valid('sandbox', 'uat')
    .default('sandbox')
    .messages({
      'any.only': 'WOMPI_ENVIRONMENT must be either "sandbox" or "uat"',
    }),
});