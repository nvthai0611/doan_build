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
exports.MiddlewareTeacher = void 0;
const prisma_service_1 = require("../../../db/prisma.service");
const common_1 = require("@nestjs/common");
const jwt_util_1 = require("../../../utils/jwt.util");
let MiddlewareTeacher = class MiddlewareTeacher {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async use(req, res, next) {
        try {
            const token = this.extractTokenFromHeader(req);
            if (!token) {
                return res.status(401).json({ message: 'Token không được cung cấp' });
            }
            const payload = jwt_util_1.default.verifyAccessToken(token);
            if (!payload || typeof payload === 'string') {
                return res.status(401).json({ message: 'Token không hợp lệ' });
            }
            if (payload.userId) {
                const findTeacher = await this.prismaService.teacher.findUnique({
                    where: { userId: payload.userId },
                });
                if (findTeacher) {
                    req.user = {
                        ...payload,
                        teacherId: findTeacher.id,
                    };
                }
                else {
                    req.user = payload;
                }
            }
            next();
        }
        catch (error) {
            console.error('Teacher middleware error:', error);
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.MiddlewareTeacher = MiddlewareTeacher;
exports.MiddlewareTeacher = MiddlewareTeacher = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MiddlewareTeacher);
//# sourceMappingURL=teacher.middleware.js.map