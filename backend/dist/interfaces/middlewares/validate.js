import { AppError, ErrorCodes } from '../../utils/errors.js';
export function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
        if (error) {
            const message = error.details.map((d) => d.message).join('; ');
            return next(new AppError(ErrorCodes.VALIDATION_ERROR, message, 400, error.details));
        }
        req[source] = value;
        next();
    };
}
//# sourceMappingURL=validate.js.map