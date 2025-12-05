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
exports.FileManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const file_management_service_1 = require("../services/file-management.service");
let FileManagementController = class FileManagementController {
    constructor(fileManagementService) {
        this.fileManagementService = fileManagementService;
    }
    async getMaterials(req, query) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.fileManagementService.getMaterials({
                ...query,
                page: query.page ? Number(query.page) : 1,
                limit: query.limit ? Number(query.limit) : 10,
            });
            return {
                success: true,
                data,
                message: 'Lấy danh sách tài liệu thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách tài liệu',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCenterClasses(req) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.fileManagementService.getCenterClasses();
            return {
                success: true,
                data,
                message: 'Lấy danh sách lớp học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteMaterial(req, id) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.fileManagementService.deleteMaterial(id);
            return {
                success: true,
                data,
                message: 'Xóa tài liệu thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi xóa tài liệu',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async incrementDownload(id) {
        try {
            const data = await this.fileManagementService.incrementDownload(id);
            return {
                success: true,
                data,
                message: 'Tăng lượt tải xuống thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FileManagementController = FileManagementController;
__decorate([
    (0, common_1.Get)('materials'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tài liệu của trung tâm' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Lọc theo lớp học' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Lọc theo danh mục' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Trang hiện tại', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Số lượng mỗi trang', example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách tài liệu thành công',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FileManagementController.prototype, "getMaterials", null);
__decorate([
    (0, common_1.Get)('classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách lớp học của trung tâm' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách lớp học thành công',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileManagementController.prototype, "getCenterClasses", null);
__decorate([
    (0, common_1.Delete)('materials/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa tài liệu' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID tài liệu', type: 'number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Xóa tài liệu thành công',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy tài liệu',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FileManagementController.prototype, "deleteMaterial", null);
__decorate([
    (0, common_1.Post)('materials/:id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Tăng số lượt tải xuống' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID tài liệu', type: 'number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tăng lượt tải xuống thành công',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileManagementController.prototype, "incrementDownload", null);
exports.FileManagementController = FileManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - File Management'),
    (0, common_1.Controller)('file-management'),
    __metadata("design:paramtypes", [file_management_service_1.FileManagementService])
], FileManagementController);
//# sourceMappingURL=file-management.controller.js.map