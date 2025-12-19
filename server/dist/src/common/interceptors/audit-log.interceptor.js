"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const audit_log_service_1 = require("../../modules/adminit/services/audit-log.service");
const prisma_service_1 = require("../../db/prisma.service");
const jwt_util_1 = require("../../utils/jwt.util");
const constants_1 = require("../constants");
let AuditLogInterceptor = class AuditLogInterceptor {
    constructor(auditLogService, prisma) {
        this.auditLogService = auditLogService;
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, ip, headers } = request;
        const user = request.user;
        const cookies = request.cookies || {};
        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }
        let userId = null;
        if (user?.userId) {
            userId = user.userId;
        }
        else if (cookies?.user) {
            try {
                const userFromCookie = typeof cookies.user === 'string'
                    ? JSON.parse(cookies.user)
                    : cookies.user;
                userId = userFromCookie?.id || userFromCookie?.userId || null;
            }
            catch {
            }
        }
        else {
            const token = headers.authorization?.split(' ')[1] ||
                cookies?.accessToken ||
                cookies?.access_token ||
                null;
            if (token) {
                try {
                    const decoded = jwt_util_1.default.verifyAccessToken(token);
                    userId = decoded?.userId || null;
                }
                catch {
                }
            }
        }
        if (!userId) {
            return next.handle();
        }
        const action = this.getActionFromMethod(method);
        const tableName = this.getTableNameFromUrl(url);
        if (!tableName) {
            return next.handle();
        }
        const recordId = request.params?.id || body?.id || null;
        const ipAddress = ip || headers['x-forwarded-for'] || headers['x-real-ip'] || null;
        const userAgent = headers['user-agent'] || null;
        const getOldValuesPromise = (async () => {
            if ((action === 'update' || action === 'delete') && recordId && tableName) {
                try {
                    const modelMap = constants_1.TABLE_NAME_TO_MODEL_NAME;
                    const modelName = modelMap[tableName];
                    if (!modelName) {
                        return null;
                    }
                    const oldRecord = await this.prisma[modelName].findUnique({
                        where: { id: recordId },
                    });
                    return oldRecord || null;
                }
                catch (error) {
                    return null;
                }
            }
            return null;
        })();
        return next.handle().pipe((0, operators_1.switchMap)(async (response) => {
            try {
                if (response?.success !== false) {
                    const fullOldValues = await getOldValuesPromise;
                    let oldValues = null;
                    let newValues = null;
                    if (action === 'create') {
                        newValues = response?.data || body || null;
                        oldValues = null;
                    }
                    else if (action === 'update') {
                        if (fullOldValues && body && typeof body === 'object') {
                            const changedFields = {};
                            const oldChangedFields = {};
                            for (const key in body) {
                                if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
                                    continue;
                                }
                                const oldValue = fullOldValues[key];
                                const newValue = body[key];
                                if (oldValue !== newValue) {
                                    oldChangedFields[key] = oldValue;
                                    changedFields[key] = newValue;
                                }
                            }
                            if (Object.keys(changedFields).length > 0) {
                                oldValues = oldChangedFields;
                                newValues = changedFields;
                            }
                            else {
                                return (0, rxjs_1.of)(response);
                            }
                        }
                        else {
                            newValues = response?.data || body || null;
                            oldValues = fullOldValues;
                        }
                    }
                    else if (action === 'delete') {
                        oldValues = fullOldValues;
                        newValues = null;
                    }
                    await this.auditLogService.createAuditLog({
                        userId,
                        action,
                        tableName,
                        recordId: recordId?.toString() || null,
                        oldValues,
                        newValues,
                        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
                        userAgent,
                    });
                }
                else {
                }
            }
            catch (error) {
                console.error('[AuditLog] Error creating log:', error);
            }
            return (0, rxjs_1.of)(response);
        }));
    }
    getActionFromMethod(method) {
        const methodMap = {
            POST: 'create',
            PATCH: 'update',
            PUT: 'update',
            DELETE: 'delete',
        };
        return methodMap[method] || 'unknown';
    }
    getTableNameFromUrl(url) {
        const routeTableMap = constants_1.AUDIT_LOG_ROUTES;
        const normalizedUrl = url.split('?')[0].toLowerCase();
        for (const [route, tableName] of Object.entries(routeTableMap)) {
            if (normalizedUrl.includes(route.toLowerCase())) {
                if (tableName === null) {
                    return null;
                }
                return tableName;
            }
        }
        return null;
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService,
        prisma_service_1.PrismaService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map