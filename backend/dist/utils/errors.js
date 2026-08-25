export const ErrorCodes = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    CONFLICT: 'CONFLICT',
    BAD_REQUEST: 'BAD_REQUEST',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export function isAppError(err) {
    return err instanceof AppError;
}
//# sourceMappingURL=errors.js.map