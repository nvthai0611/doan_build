"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
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
            return hasToNumber ? value.toNumber() : parseFloat(value.toString());
        }
        catch {
            return value.toString();
        }
    }
    if (Array.isArray(value))
        return value.map(serializeForJson);
    const output = {};
    for (const key of Object.keys(value)) {
        output[key] = serializeForJson(value[key]);
    }
    return output;
}
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((result) => {
            const statusCode = context.switchToHttp().getResponse().statusCode;
            if (result && typeof result === 'object' && 'data' in result) {
                const serializedResult = {};
                for (const key of Object.keys(result)) {
                    serializedResult[key] = serializeForJson(result[key]);
                }
                return {
                    success: true,
                    status: statusCode,
                    ...serializedResult,
                };
            }
            return {
                success: true,
                status: statusCode,
                data: serializeForJson(result),
                meta: {},
                message: '',
            };
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map