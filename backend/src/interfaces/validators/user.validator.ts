import Joi from 'joi';

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    'string.pattern.base':
      'Password must contain uppercase, lowercase, number and special character',
  });

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: passwordSchema.required(),
  name: Joi.string().min(1).max(255).required(),
  role: Joi.string().valid('ADMIN', 'EMPLOYEE').default('EMPLOYEE'),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  role: Joi.string().valid('ADMIN', 'EMPLOYEE'),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  password: passwordSchema,
}).min(1);

export const listUsersSchema = Joi.object({
  search: Joi.string().allow(''),
  role: Joi.string().valid('ADMIN', 'EMPLOYEE'),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0),
});
