import Joi from 'joi';

export const createExpenseSchema = Joi.object({
  category: Joi.string().min(1).required(),
  amount: Joi.number().min(0).required(),
  description: Joi.string().allow('', null),
  expenseDate: Joi.date().iso().required(),
});

export const updateExpenseSchema = Joi.object({
  category: Joi.string().min(1),
  amount: Joi.number().min(0),
  description: Joi.string().allow('', null),
  expenseDate: Joi.date().iso(),
}).min(1);

export const listExpensesSchema = Joi.object({
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
  category: Joi.string(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0),
});
