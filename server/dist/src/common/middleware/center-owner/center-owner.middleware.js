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
exports.MiddlewareCenterOwner = void 0;
const prisma_service_1 = require("../../../db/prisma.service");
const common_1 = require("@nestjs/common");
const jwt_util_1 = require("../../../utils/jwt.util");
let MiddlewareCenterOwner = class MiddlewareCenterOwner {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async use(req, res, next) {
        try {
            const token = this.extractTokenFromHeader(req);
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token không được cung cấp. Vui lòng đăng nhập.'
                });
            }
            const payload = jwt_util_1.default.verifyAccessToken(token);
            if (!payload || typeof payload === 'string') {
                return res.status(401).json({
                    success: false,
                    message: 'Token không hợp lệ hoặc đã hết hạn.'
                });
            }
            const url = req.originalUrl || req.url || '';
            const isStudentCreateRoute = req.method === 'POST' && /\/admin-center\/student-management(\/)?$/i.test(url.split('?')[0]);
            if (payload.role === 'center_owner') {
            }
            else if (payload.role === 'parent' && isStudentCreateRoute) {
            }
            else {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền truy cập. Chỉ chủ trung tâm mới được phép.'
                });
            }
            req.user = {
                ...payload,
                isCenterOwner: payload.role === 'center_owner',
            };
            next();
        }
        catch (error) {
            console.error('Center Owner middleware error:', error);
            return res.status(401).json({
                success: false,
                message: 'Xác thực thất bại. Vui lòng đăng nhập lại.'
            });
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.MiddlewareCenterOwner = MiddlewareCenterOwner;
exports.MiddlewareCenterOwner = MiddlewareCenterOwner = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MiddlewareCenterOwner);
//# sourceMappingURL=center-owner.middleware.js.map