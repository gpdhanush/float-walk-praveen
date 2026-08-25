export declare const ErrorCodes: {
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly CONFLICT: "CONFLICT";
    readonly BAD_REQUEST: "BAD_REQUEST";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: unknown | undefined);
}
export declare function isAppError(err: unknown): err is AppError;
//# sourceMappingURL=errors.d.ts.map