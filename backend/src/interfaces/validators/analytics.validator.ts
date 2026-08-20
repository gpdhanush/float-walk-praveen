import Joi from 'joi';

/**
 * Schema for validating page view recording requests.
 * Note: Detailed validation happens in AnalyticsService.validatePageViewRequest
 */
export const pageViewSchema = Joi.object({
  page_path: Joi.string().required(),
  visitor_id: Joi.string().uuid().required(),
  referrer: Joi.string().optional().allow(''),
});

/**
 * Schema for validating date range queries in admin endpoint.
 */
export const dateRangeSchema = Joi.object({
  from: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'from must be in YYYY-MM-DD format',
    }),
  to: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'to must be in YYYY-MM-DD format',
    }),
});
