import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  PORT: Joi.number().port().optional(),
  JWT_SECRET: Joi.string().optional(),
});
