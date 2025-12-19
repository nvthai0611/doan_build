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
exports.ScholarshipManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scholarship_management_service_1 = require("../services/scholarship-management.service");
const create_scholarship_dto_1 = require("../dto/scholarship/create-scholarship.dto");
const update_scholarship_dto_1 = require("../dto/scholarship/update-scholarship.dto");
const query_scholarship_dto_1 = require("../dto/scholarship/query-scholarship.dto");
let ScholarshipManagementController = class ScholarshipManagementController {
    constructor(scholarshipManagementService) {
        this.scholarshipManagementService = scholarshipManagementService;
    }
    async findAll(query) {
        const result = await this.scholarshipManagementService.findAll(query);
        return {
            success: true,
            message: 'Lấy danh sách học bổng thành công',
            ...result,
        };
    }
    async findOne(id) {
        const scholarship = await this.scholarshipManagementService.findOne(id);
        return {
            success: true,
            message: 'Lấy thông tin học bổng thành công',
            data: scholarship,
        };
    }
    async create(createScholarshipDto) {
        const scholarship = await this.scholarshipManagementService.create(createScholarshipDto);
        return {
            success: true,
            message: 'Tạo học bổng thành công',
            data: scholarship,
        };
    }
    async update(id, updateScholarshipDto) {
        const scholarship = await this.scholarshipManagementService.update(id, updateScholarshipDto);
        return {
            success: true,
            message: 'Cập nhật học bổng thành công',
            data: scholarship,
        };
    }
    async remove(id) {
        return await this.scholarshipManagementService.remove(id);
    }
    async assignToStudent(studentId, body) {
        const result = await this.scholarshipManagementService.assignToStudent(studentId, body.scholarshipId);
        return {
            success: true,
            message: body.scholarshipId
                ? 'Gán học bổng cho học sinh thành công'
                : 'Gỡ học bổng khỏi học sinh thành công',
            data: result,
        };
    }
};
exports.ScholarshipManagementController = ScholarshipManagementController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách học bổng với pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách học bổng' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_scholarship_dto_1.QueryScholarshipDto]),
    __metadata("design:returntype", Promise)
], ScholarshipManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin một học bổng theo ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của học bổng' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thông tin học bổng' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy học bổng' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScholarshipManagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo học bổng mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Học bổng được tạo thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_scholarship_dto_1.CreateScholarshipDto]),
    __metadata("design:returntype", Promise)
], ScholarshipManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin học bổng' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của học bổng' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật học bổng thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy học bổng' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_scholarship_dto_1.UpdateScholarshipDto]),
    __metadata("design:returntype", Promise)
], ScholarshipManagementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa học bổng' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của học bổng' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa học bổng thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy học bổng' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Học bổng đang được sử dụng' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScholarshipManagementController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('assign/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Gán học bổng cho học sinh' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'ID của học sinh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Gán học bổng thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy học sinh hoặc học bổng' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScholarshipManagementController.prototype, "assignToStudent", null);
exports.ScholarshipManagementController = ScholarshipManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Scholarship Management'),
    (0, common_1.Controller)('scholarships'),
    __metadata("design:paramtypes", [scholarship_management_service_1.ScholarshipManagementService])
], ScholarshipManagementController);
//# sourceMappingURL=scholarship-management.controller.js.map