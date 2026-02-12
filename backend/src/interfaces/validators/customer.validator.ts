import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  mobile: Joi.string().min(10).max(20).required(),
  email: Joi.string().email().allow('', null),
  address: Joi.string().allow('', null),
  whatsapp: Joi.string().allow('', null),
  altContact: Joi.string().allow('', null),
  gender: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
});

export const updateCustomerSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  mobile: Joi.string().min(10).max(20),
  email: Joi.string().email().allow('', null),
  address: Joi.string().allow('', null),
  whatsapp: Joi.string().allow('', null),
  altContact: Joi.string().allow('', null),
  gender: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
}).min(1);

export const listCustomersSchema = Joi.object({
  search: Joi.string().allow(''),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0),
});
