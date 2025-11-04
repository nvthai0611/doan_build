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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsManageController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const contracts_manage_service_1 = require("../services/contracts-manage.service");
const prisma_service_1 = require("../../../db/prisma.service");
let ContractsManageController = class ContractsManageController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async list(req) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException('Unauthorized', common_1.HttpStatus.UNAUTHORIZED);
            }
            const teacher = await this.prisma.teacher.findFirst({ where: { userId }, select: { id: true } });
            if (!teacher) {
                throw new common_1.HttpException('Teacher not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.service.listByTeacher(teacher.id);
            return { success: true, data };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Error', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async upload(req, file, contractType, expiryDate, notes) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException('Unauthorized', common_1.HttpStatus.UNAUTHORIZED);
            }
            const teacher = await this.prisma.teacher.findFirst({ where: { userId }, select: { id: true } });
            if (!teacher) {
                throw new common_1.HttpException('Teacher not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.service.createForTeacher(teacher.id, file, contractType, expiryDate, notes);
            return { success: true, data };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Error', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(req, id) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException('Unauthorized', common_1.HttpStatus.UNAUTHORIZED);
            }
            const teacher = await this.prisma.teacher.findFirst({ where: { userId }, select: { id: true } });
            if (!teacher) {
                throw new common_1.HttpException('Teacher not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.service.deleteForTeacher(teacher.id, id);
            return { success: true, data };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Error', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ContractsManageController = ContractsManageController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get contract uploads for teacher' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsManageController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                contractType: { type: 'string' },
                expiryDate: { type: 'string', format: 'date' },
                notes: { type: 'string' },
                file: { type: 'string', format: 'binary' },
            },
            required: ['file', 'expiryDate'],
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a contract file' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('contractType')),
    __param(3, (0, common_1.Body)('expiryDate')),
    __param(4, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ContractsManageController.prototype, "upload", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Contract upload id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a contract upload' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContractsManageController.prototype, "remove", null);
exports.ContractsManageController = ContractsManageController = __decorate([
    (0, swagger_1.ApiTags)('Teacher - Contracts'),
    (0, common_1.Controller)('contracts'),
    __metadata("design:paramtypes", [contracts_manage_service_1.ContractsManageService,
        prisma_service_1.PrismaService])
], ContractsManageController);
//# sourceMappingURL=contracts-manage.controller.js.map