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
exports.EnrollmentManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enrollment_management_service_1 = require("../services/enrollment-management.service");
let EnrollmentManagementController = class EnrollmentManagementController {
    constructor(enrollmentManagementService) {
        this.enrollmentManagementService = enrollmentManagementService;
    }
    async create(body) {
        return this.enrollmentManagementService.create(body);
    }
    async bulkEnroll(body) {
        return this.enrollmentManagementService.bulkEnroll(body);
    }
    async findAll(query) {
        return this.enrollmentManagementService.findAll(query);
    }
    async delete(id) {
        return this.enrollmentManagementService.delete(id);
    }
    async findByClass(classId, query) {
        return this.enrollmentManagementService.findByClass(classId, query);
    }
    async checkCapacity(classId) {
        return this.enrollmentManagementService.checkCapacity(classId);
    }
    async getAvailableStudents(classId, query) {
        return this.enrollmentManagementService.getAvailableStudents(classId, query);
    }
    async findByStudent(studentId) {
        return this.enrollmentManagementService.findByStudent(studentId);
    }
    async updateStatus(id, body) {
        return this.enrollmentManagementService.updateStatus(id, body);
    }
    async transfer(id, body) {
        return this.enrollmentManagementService.transfer(id, body);
    }
};
exports.EnrollmentManagementController = EnrollmentManagementController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng ký 1 học sinh vào lớp' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Đăng ký thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Đã đăng ký hoặc lớp đầy' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy học sinh hoặc lớp' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng ký nhiều học sinh vào lớp' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Đăng ký hoàn tất' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Không đủ chỗ hoặc dữ liệu không hợp lệ' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "bulkEnroll", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả enrollments với filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách enrollments' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa enrollment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy enrollment' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('class/:classId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách học sinh trong lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách học sinh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "findByClass", null);
__decorate([
    (0, common_1.Get)('class/:classId/capacity'),
    (0, swagger_1.ApiOperation)({ summary: 'Kiểm tra còn chỗ trong lớp không' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thông tin capacity' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "checkCapacity", null);
__decorate([
    (0, common_1.Get)('class/:classId/available-students'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách students CHƯA enroll vào lớp này' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách students có thể thêm vào lớp' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "getAvailableStudents", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch sử enrollment của học sinh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lịch sử enrollment' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái enrollment (active/completed/withdrawn)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy enrollment' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Chuyển lớp cho học sinh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chuyển lớp thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Lớp mới đầy hoặc đã đăng ký' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy enrollment hoặc lớp mới' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentManagementController.prototype, "transfer", null);
exports.EnrollmentManagementController = EnrollmentManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Enrollment Management'),
    (0, common_1.Controller)('enrollments'),
    __metadata("design:paramtypes", [enrollment_management_service_1.EnrollmentManagementService])
], EnrollmentManagementController);
//# sourceMappingURL=enrollment-management.controller.js.map