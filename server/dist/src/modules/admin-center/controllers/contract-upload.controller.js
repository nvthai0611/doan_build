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
exports.ContractUploadController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const contract_upload_service_1 = require("../services/contract-upload.service");
let ContractUploadController = class ContractUploadController {
    constructor(contractUploadService) {
        this.contractUploadService = contractUploadService;
    }
    async getByStudentId(studentId) {
        try {
            const data = await this.contractUploadService.getByStudentId(studentId);
            return { success: true, data };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Error fetching contracts', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadContract(studentId, applicationFile, body) {
        try {
            if (!applicationFile) {
                throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
            }
            let parsedSubjectIds = [];
            if (body.subjectIds) {
                try {
                    parsedSubjectIds = typeof body.subjectIds === 'string' ? JSON.parse(body.subjectIds) : body.subjectIds;
                }
                catch (e) {
                    parsedSubjectIds = [];
                }
            }
            const data = await this.contractUploadService.uploadContract(studentId, applicationFile, {
                parentId: body.parentId,
                contractType: body.contractType || 'application',
                subjectIds: parsedSubjectIds,
                note: body.note,
                expiredAt: body.expiredAt ? new Date(body.expiredAt) : undefined,
            });
            return { success: true, data, message: 'Upload đơn xin học thành công' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Error uploading contract', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateContract(contractId, body) {
        try {
            const data = await this.contractUploadService.updateContract(contractId, {
                ...body,
                expiredAt: body.expiredAt ? new Date(body.expiredAt) : undefined,
            });
            return { success: true, data, message: 'Cập nhật hợp đồng thành công' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Error updating contract', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteContract(contractId) {
        try {
            await this.contractUploadService.deleteContract(contractId);
            return { success: true, message: 'Xóa hợp đồng thành công' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Error deleting contract', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ContractUploadController = ContractUploadController;
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all contract uploads for a student' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID (UUID)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractUploadController.prototype, "getByStudentId", null);
__decorate([
    (0, common_1.Post)('student/:studentId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('applicationFile', {
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.HttpException('Chỉ chấp nhận file PDF, JPG hoặc PNG', common_1.HttpStatus.BAD_REQUEST), false);
            }
        }
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload contract for student' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID (UUID)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                parentId: { type: 'string', format: 'uuid' },
                contractType: { type: 'string', default: 'application' },
                subjectIds: { type: 'string', description: 'JSON array of subject IDs' },
                note: { type: 'string' },
                expiredAt: { type: 'string', format: 'date-time' },
                applicationFile: { type: 'string', format: 'binary' },
            },
            required: ['applicationFile']
        }
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ContractUploadController.prototype, "uploadContract", null);
__decorate([
    (0, common_1.Put)(':contractId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update contract' }),
    (0, swagger_1.ApiParam)({ name: 'contractId', description: 'Contract ID (UUID)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('contractId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractUploadController.prototype, "updateContract", null);
__decorate([
    (0, common_1.Delete)(':contractId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete contract' }),
    (0, swagger_1.ApiParam)({ name: 'contractId', description: 'Contract ID (UUID)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('contractId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractUploadController.prototype, "deleteContract", null);
exports.ContractUploadController = ContractUploadController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Contract Uploads'),
    (0, common_1.Controller)('contract-uploads'),
    __metadata("design:paramtypes", [contract_upload_service_1.ContractUploadService])
], ContractUploadController);
//# sourceMappingURL=contract-upload.controller.js.map