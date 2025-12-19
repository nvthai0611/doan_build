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
exports.ShowcaseManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const showcase_management_service_1 = require("../services/showcase-management.service");
let ShowcaseManagementController = class ShowcaseManagementController {
    constructor(showcaseManagementService) {
        this.showcaseManagementService = showcaseManagementService;
    }
    async getAllShowcases(query) {
        try {
            return await this.showcaseManagementService.getAllShowcases({
                page: query.page ? Number(query.page) : 1,
                limit: query.limit ? Number(query.limit) : 10,
                search: query.search,
                featured: query.featured === 'true' ? true : query.featured === 'false' ? false : undefined,
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy danh sách học sinh tiêu biểu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getShowcaseById(id) {
        return await this.showcaseManagementService.getShowcaseById(id);
    }
    async createShowcase(createShowcaseDto, file) {
        try {
            if (file) {
                createShowcaseDto.studentImage = file;
            }
            if (createShowcaseDto.featured === 'true') {
                createShowcaseDto.featured = true;
            }
            else if (createShowcaseDto.featured === 'false') {
                createShowcaseDto.featured = false;
            }
            if (createShowcaseDto.order) {
                createShowcaseDto.order = Number(createShowcaseDto.order);
            }
            if (createShowcaseDto.publishedAt) {
                createShowcaseDto.publishedAt = new Date(createShowcaseDto.publishedAt);
            }
            return await this.showcaseManagementService.createShowcase(createShowcaseDto);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Lỗi khi tạo học sinh tiêu biểu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateShowcase(id, updateShowcaseDto, file) {
        try {
            if (file) {
                updateShowcaseDto.studentImage = file;
            }
            if (updateShowcaseDto.featured === 'true') {
                updateShowcaseDto.featured = true;
            }
            else if (updateShowcaseDto.featured === 'false') {
                updateShowcaseDto.featured = false;
            }
            if (updateShowcaseDto.order) {
                updateShowcaseDto.order = Number(updateShowcaseDto.order);
            }
            if (updateShowcaseDto.publishedAt) {
                updateShowcaseDto.publishedAt = new Date(updateShowcaseDto.publishedAt);
            }
            return await this.showcaseManagementService.updateShowcase(id, updateShowcaseDto);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Lỗi khi cập nhật học sinh tiêu biểu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteShowcase(id) {
        return await this.showcaseManagementService.deleteShowcase(id);
    }
};
exports.ShowcaseManagementController = ShowcaseManagementController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách học sinh tiêu biểu' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'featured', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách học sinh tiêu biểu',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShowcaseManagementController.prototype, "getAllShowcases", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin chi tiết học sinh tiêu biểu' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Thông tin học sinh tiêu biểu',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy học sinh tiêu biểu',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShowcaseManagementController.prototype, "getShowcaseById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('studentImage')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo học sinh tiêu biểu mới' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['title', 'studentImage', 'achievement'],
            properties: {
                title: { type: 'string', description: 'Tên học sinh' },
                description: { type: 'string', description: 'Mô tả hành trình' },
                studentImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Ảnh học sinh',
                },
                achievement: { type: 'string', description: 'Thành tích' },
                featured: { type: 'boolean', description: 'Nổi bật' },
                order: { type: 'number', description: 'Thứ tự hiển thị' },
                publishedAt: { type: 'string', format: 'date-time', description: 'Ngày publish' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Tạo học sinh tiêu biểu thành công',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Dữ liệu không hợp lệ',
    }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShowcaseManagementController.prototype, "createShowcase", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('studentImage')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin học sinh tiêu biểu' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                studentImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Ảnh học sinh (optional)',
                },
                achievement: { type: 'string' },
                featured: { type: 'boolean' },
                order: { type: 'number' },
                publishedAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cập nhật học sinh tiêu biểu thành công',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy học sinh tiêu biểu',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ShowcaseManagementController.prototype, "updateShowcase", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa học sinh tiêu biểu' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Xóa học sinh tiêu biểu thành công',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy học sinh tiêu biểu',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShowcaseManagementController.prototype, "deleteShowcase", null);
exports.ShowcaseManagementController = ShowcaseManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Showcase Management'),
    (0, common_1.Controller)('showcase-management'),
    __metadata("design:paramtypes", [showcase_management_service_1.ShowcaseManagementService])
], ShowcaseManagementController);
//# sourceMappingURL=showcase-management.controller.js.map