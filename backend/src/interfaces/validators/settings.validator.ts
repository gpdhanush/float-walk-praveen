import Joi from 'joi';

export const updateSettingsSchema = Joi.object({
  storeName: Joi.string().min(1).max(255),
  ownerName: Joi.string().allow('', null),
  logoUrl: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  mobile: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  taxNumber: Joi.string().allow('', null),
  gstPercent: Joi.number().min(0).max(100),
  gstNumber: Joi.string().allow('', null),
  theme: Joi.string().valid('light', 'dark'),
  themeColor: Joi.string().allow('', null),
  language: Joi.string().valid('en', 'ta'),
}).min(1);
