import Joi from 'joi';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { webResourceDefinitions } from '../../infrastructure/db/repositories/WebAdminRepository.js';
const dateOnly = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);
const schemas = {
    enquiries: Joi.object({
        name: Joi.string().min(1).max(150).required(), phone: Joi.string().min(1).max(20).required(),
        email: Joi.string().email().max(255).required(), service: Joi.string().min(1).max(150).required(),
        preferred_date: dateOnly.allow(null, ''), preferred_time: Joi.string().allow(null, ''),
        message: Joi.string().allow(null, ''), status: Joi.string().valid('new', 'contacted', 'completed', 'cancelled'),
    }),
    appointments: Joi.object({
        customer_name: Joi.string().min(1).max(150).required(), phone: Joi.string().min(1).max(20).required(),
        service: Joi.string().min(1).max(150).required(), preferred_date: dateOnly.required(),
        preferred_time: Joi.string().required(), message: Joi.string().allow(null, ''),
        status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled', 'no_show'),
        confirmation_method: Joi.string().valid('phone', 'whatsapp', 'both').allow(null, ''),
    }),
    testimonials: Joi.object({
        customer_name: Joi.string().min(1).max(150).required(), rating: Joi.number().integer().min(1).max(5).required(),
        testimonial: Joi.string().min(1).required(), service: Joi.string().max(150).allow(null, ''),
        review_date: dateOnly.allow(null, ''), is_published: Joi.boolean(),
    }),
    gallery: Joi.object({
        media_id: Joi.string().min(1).max(150).required(), type: Joi.string().valid('image', 'instagram', 'youtube').required(),
        title: Joi.string().min(1).max(255).required(), caption: Joi.string().allow(null, ''),
        src: Joi.when('type', { is: 'image', then: Joi.string().max(500).required(), otherwise: Joi.string().max(500).allow(null, '') }),
        url: Joi.when('type', { is: Joi.valid('instagram', 'youtube'), then: Joi.string().max(500).required(), otherwise: Joi.string().max(500).allow(null, '') }),
        poster: Joi.string().max(500).allow(null, ''), is_active: Joi.boolean(), sort_order: Joi.number().integer().min(0),
    }),
    services: Joi.object({
        service_name: Joi.string().min(1).max(150).required(), description: Joi.string().allow(null, ''), is_active: Joi.boolean(),
    }),
};
export function validateWebPayload(req, _res, next) {
    const resource = req.params.resource;
    if (!webResourceDefinitions[resource]) {
        next(new AppError(ErrorCodes.NOT_FOUND, 'Web resource not found', 404));
        return;
    }
    const schema = req.method === 'PATCH'
        ? schemas[resource].fork(Object.keys(req.body), (field) => field.optional())
        : schemas[resource];
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        next(new AppError(ErrorCodes.VALIDATION_ERROR, error.details.map((detail) => detail.message).join(', '), 400));
        return;
    }
    req.body = value;
    next();
}
//# sourceMappingURL=webAdmin.validator.js.map