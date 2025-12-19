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
exports.SchoolManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const school_management_service_1 = require("../services/school-management.service");
const create_school_dto_1 = require("../dto/school/create-school.dto");
const update_school_dto_1 = require("../dto/school/update-school.dto");
let SchoolManagementController = class SchoolManagementController {
    constructor(schoolManagementService) {
        this.schoolManagementService = schoolManagementService;
    }
    async getStats() {
        const stats = await this.schoolManagementService.getStats();
        return {
            success: true,
            message: 'Lấy thống kê thành công',
            data: stats,
        };
    }
    async findAll() {
        const schools = await this.schoolManagementService.findAll();
        return {
            success: true,
            message: 'Lấy danh sách trường học thành công',
            data: schools,
        };
    }
    async findOne(id) {
        const school = await this.schoolManagementService.findOne(id);
        return {
            success: true,
            message: 'Lấy thông tin trường học thành công',
            data: school,
        };
    }
    async create(createSchoolDto) {
        const school = await this.schoolManagementService.create(createSchoolDto);
        return {
            success: true,
            message: 'Tạo trường học thành công',
            data: school,
        };
    }
    async update(id, updateSchoolDto) {
        const school = await this.schoolManagementService.update(id, updateSchoolDto);
        return {
            success: true,
            message: 'Cập nhật trường học thành công',
            data: school,
        };
    }
    async remove(id) {
        return await this.schoolManagementService.remove(id);
    }
};
exports.SchoolManagementController = SchoolManagementController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thống kê tổng quan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thống kê trường học, học sinh, giáo viên' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchoolManagementController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả trường học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách trường học' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchoolManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin một trường học theo ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của trường học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thông tin trường học' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy trường học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchoolManagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo trường học mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trường học được tạo thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc trường học đã tồn tại' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_school_dto_1.CreateSchoolDto]),
    __metadata("design:returntype", Promise)
], SchoolManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin trường học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của trường học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật trường học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy trường học' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_school_dto_1.UpdateSchoolDto]),
    __metadata("design:returntype", Promise)
], SchoolManagementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa trường học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của trường học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa trường học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy trường học' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Trường học đang được sử dụng' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchoolManagementController.prototype, "remove", null);
exports.SchoolManagementController = SchoolManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - School Management'),
    (0, common_1.Controller)('schools'),
    __metadata("design:paramtypes", [school_management_service_1.SchoolManagementService])
], SchoolManagementController);
//# sourceMappingURL=school-management.controller.js.map