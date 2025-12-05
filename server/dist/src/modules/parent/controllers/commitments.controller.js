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
exports.CommitmentsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const commitments_service_1 = require("../services/commitments.service");
const upload_commitment_dto_1 = require("../dto/request/upload-commitment.dto");
const prisma_service_1 = require("../../../db/prisma.service");
let CommitmentsController = class CommitmentsController {
    constructor(commitmentsService, prisma) {
        this.commitmentsService = commitmentsService;
        this.prisma = prisma;
    }
    async getStudentCommitments(req, studentId) {
        try {
            const parentId = req.user?.userId;
            if (!parentId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin người dùng' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const parent = await this.prisma.parent.findUnique({
                where: { userId: parentId },
                select: { id: true },
            });
            if (!parent) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.commitmentsService.getStudentCommitments(studentId, parent.id);
            return { success: true, data };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách hợp đồng cam kết',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadCommitment(req, file, dto) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin người dùng' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const parent = await this.prisma.parent.findUnique({
                where: { userId: parentUserId },
                select: { id: true },
            });
            if (!parent) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            let subjectIds = [];
            try {
                if (typeof dto.subjectIds === 'string') {
                    const parsed = JSON.parse(dto.subjectIds);
                    if (Array.isArray(parsed)) {
                        subjectIds = parsed;
                    }
                    else {
                        throw new common_1.BadRequestException('subjectIds phải là mảng JSON hợp lệ');
                    }
                }
                else if (Array.isArray(dto.subjectIds)) {
                    subjectIds = dto.subjectIds;
                }
                else {
                    throw new common_1.BadRequestException('subjectIds phải là mảng JSON hợp lệ');
                }
            }
            catch (e) {
                if (e instanceof common_1.BadRequestException) {
                    throw e;
                }
                throw new common_1.BadRequestException('subjectIds phải là mảng JSON hợp lệ');
            }
            if (subjectIds.length === 0) {
                throw new common_1.BadRequestException('Phải chọn ít nhất một môn học');
            }
            const data = await this.commitmentsService.uploadCommitment(parent.id, dto.studentId, file, subjectIds, dto.note);
            return { success: true, data };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi upload hợp đồng cam kết',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteCommitment(req, commitmentId, studentId) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin người dùng' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const parent = await this.prisma.parent.findUnique({
                where: { userId: parentUserId },
                select: { id: true },
            });
            if (!parent) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.commitmentsService.deleteCommitment(commitmentId, studentId, parent.id);
            return { success: true, ...data };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xóa hợp đồng cam kết',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CommitmentsController = CommitmentsController;
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách hợp đồng cam kết của học sinh' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách hợp đồng cam kết' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy học sinh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommitmentsController.prototype, "getStudentCommitments", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload hợp đồng cam kết mới cho học sinh' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                studentId: { type: 'string', format: 'uuid' },
                file: { type: 'string', format: 'binary' },
                subjectIds: {
                    type: 'string',
                    description: 'JSON string array of subject IDs, e.g. ["uuid1", "uuid2"]'
                },
                note: { type: 'string' },
            },
            required: ['studentId', 'file', 'subjectIds'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Upload hợp đồng thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy học sinh' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, upload_commitment_dto_1.UploadCommitmentDto]),
    __metadata("design:returntype", Promise)
], CommitmentsController.prototype, "uploadCommitment", null);
__decorate([
    (0, common_1.Delete)(':commitmentId/student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa hợp đồng cam kết' }),
    (0, swagger_1.ApiParam)({ name: 'commitmentId', description: 'Commitment ID' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa hợp đồng thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy hợp đồng' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Không thể xóa hợp đồng đang được sử dụng' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('commitmentId')),
    __param(2, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CommitmentsController.prototype, "deleteCommitment", null);
exports.CommitmentsController = CommitmentsController = __decorate([
    (0, swagger_1.ApiTags)('Parent - Commitments'),
    (0, common_1.Controller)('commitments'),
    __metadata("design:paramtypes", [commitments_service_1.CommitmentsService,
        prisma_service_1.PrismaService])
], CommitmentsController);
//# sourceMappingURL=commitments.controller.js.map