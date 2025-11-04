"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
function serializeForJson(value) {
    if (typeof value === 'bigint')
        return value.toString();
    if (value === null || typeof value !== 'object')
        return value;
    if (value instanceof Date)
        return value.toISOString();
    const hasToNumber = typeof value.toNumber === 'function';
    const hasToString = typeof value.toString === 'function';
    if (hasToNumber || (hasToString && value.constructor?.name === 'Decimal')) {
        try {
            return hasToNumber
                ? value.toNumber()
                : parseFloat(value.toString());
        }
        catch {
            return value.toString();
        }
    }
    if (Array.isArray(value))
        return value.map(serializeForJson);
    const output = {};
    for (const key of Object.keys(value))
        output[key] = serializeForJson(value[key]);
    return output;
}
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const response = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : { message: exception.message };
        let message;
        let error;
        if (typeof response === 'string') {
            message = response;
            error = this.getErrorNameFromStatus(status);
        }
        else if (response && typeof response === 'object') {
            message = response.message || 'Something went wrong';
            error = response.error || this.getErrorNameFromStatus(status);
        }
        else {
            message = 'Something went wrong';
            error = 'Internal Server Error';
        }
        res.status(status).json({
            success: false,
            status,
            error: serializeForJson(error),
            message: serializeForJson(message) || 'Internal server error',
        });
    }
    getErrorNameFromStatus(status) {
        switch (status) {
            case 400:
                return 'Bad Request';
            case 401:
                return 'Unauthorized';
            case 403:
                return 'Forbidden';
            case 404:
                return 'Not Found';
            case 409:
                return 'Conflict';
            case 422:
                return 'Unprocessable Entity';
            case 500:
                return 'Internal Server Error';
            default:
                return 'Unknown Error';
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map