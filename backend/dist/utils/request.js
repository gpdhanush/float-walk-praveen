/** Get single :id param from request (Express may return string | string[]). */
export function getParamId(req, param = 'id') {
    const value = req.params[param];
    return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}
//# sourceMappingURL=request.js.map