import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(1).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().allow('', null),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(1),
  price: Joi.number().min(0),
  description: Joi.string().allow('', null),
}).min(1);

export const listProductsSchema = Joi.object({
  q: Joi.string().allow('', null),
  limit: Joi.number().integer().min(1).max(200).default(100),
  offset: Joi.number().integer().min(0).default(0),
});

