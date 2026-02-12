import Joi from 'joi';

export const reportDateRangeSchema = Joi.object({
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
});
