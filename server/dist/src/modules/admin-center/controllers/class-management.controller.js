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
exports.ClassManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_management_service_1 = require("../services/class-management.service");
const create_class_dto_1 = require("../dto/class/create-class.dto");
const update_class_dto_1 = require("../dto/class/update-class.dto");
const update_class_status_dto_1 = require("../dto/class/update-class-status.dto");
const query_class_dto_1 = require("../dto/class/query-class.dto");
let ClassManagementController = class ClassManagementController {
    constructor(classManagementService) {
        this.classManagementService = classManagementService;
    }
    async create(createClassDto) {
        return this.classManagementService.create(createClassDto);
    }
    async findAll(queryDto) {
        return this.classManagementService.findAll(queryDto);
    }
    async getClassesForTransfer(queryDto) {
        return this.classManagementService.findAllWithTeacher(queryDto);
    }
    async findOne(id) {
        return this.classManagementService.findOne(id);
    }
    async update(id, updateClassDto) {
        return this.classManagementService.update(id, updateClassDto);
    }
    async updateStatus(id, updateClassStatusDto) {
        return this.classManagementService.updateStatus(id, updateClassStatusDto);
    }
    async updateClassSchedules(id, body) {
        return this.classManagementService.updateClassSchedules(id, body);
    }
    async delete(id) {
        return this.classManagementService.delete(id);
    }
    async cloneClass(id, body) {
        return this.classManagementService.cloneClass(id, body);
    }
    async assignTeacher(classId, body) {
        return this.classManagementService.assignTeacher(classId, body);
    }
    async removeTeacher(classId, teacherId) {
        return this.classManagementService.removeTeacher(classId, teacherId);
    }
    async getTeachersByClass(classId) {
        return this.classManagementService.getTeachersByClass(classId);
    }
    async transferTeacher(classId, body, req) {
        const requestedBy = req.user?.userId;
        if (!requestedBy) {
            throw new common_2.HttpException({
                success: false,
                message: 'Không xác định được người yêu cầu',
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.classManagementService.transferTeacher(classId, body, requestedBy);
    }
    async validateTransfer(classId, replacementTeacherId, effectiveDate, substituteEndDate) {
        if (!replacementTeacherId) {
            throw new common_2.HttpException({ success: false, message: 'Thiếu replacementTeacherId' }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.classManagementService.validateTransferConflict(classId, {
            replacementTeacherId,
            effectiveDate,
            substituteEndDate,
        });
    }
    async getTransferRequests(query) {
        return this.classManagementService.getTransferRequests(query);
    }
    async approveTransfer(transferId, body, req) {
        const approvedBy = req.user?.userId;
        if (!approvedBy) {
            throw new common_2.HttpException({
                success: false,
                message: 'Không xác định được người duyệt',
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.classManagementService.approveTransfer(transferId, body, approvedBy);
    }
    async rejectTransfer(transferId, body, req) {
        const rejectedBy = req.user?.userId;
        if (!rejectedBy) {
            throw new common_2.HttpException({
                success: false,
                message: 'Không xác định được người từ chối',
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.classManagementService.rejectTransfer(transferId, body, rejectedBy);
    }
    async getStats(classId) {
        return this.classManagementService.getStats(classId);
    }
    async getDashboard(classId) {
        return this.classManagementService.getDashboard(classId);
    }
    async generateSessions(classId, body) {
        return this.classManagementService.generateSessions(classId, body);
    }
    async getClassSessions(classId, query) {
        return this.classManagementService.getClassSessions(classId, query);
    }
    async deleteSessions(classId, body) {
        return this.classManagementService.deleteSessions(classId, body.sessionIds);
    }
    async getClassByTeacher(query, teacherId) {
        return this.classManagementService.getClassByTeacherId(query, teacherId);
    }
    async getClassByTeacherId(id) {
        return this.classManagementService.getClassDetail(id);
    }
    async createClassLegacy(body) {
        return this.classManagementService.createClass(body);
    }
};
exports.ClassManagementController = ClassManagementController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo lớp học mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tạo lớp học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_dto_1.CreateClassDto]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả lớp học với filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_class_dto_1.QueryClassDto]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('transfer-available'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách lớp học khả dụng cho chuyển lớp (bao gồm thông tin giáo viên)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách lớp học với thông tin giáo viên',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_class_dto_1.QueryClassDto]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getClassesForTransfer", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết 1 lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chi tiết lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_dto_1.UpdateClassDto]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật trạng thái thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_status_dto_1.UpdateClassStatusDto]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/schedules'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật lịch học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "updateClassSchedules", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa lớp học (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa thành công' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Không thể xóa lớp có học sinh đang học',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Clone lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Clone lớp học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học gốc' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "cloneClass", null);
__decorate([
    (0, common_1.Post)(':id/assign-teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Phân công giáo viên cho lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Phân công thành công' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Giáo viên đã được phân công hoặc lịch học bị trùng với các lớp đã được phân công',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy lớp hoặc giáo viên',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "assignTeacher", null);
__decorate([
    (0, common_1.Delete)(':id/teachers/:teacherId'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa phân công giáo viên' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa phân công thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy phân công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "removeTeacher", null);
__decorate([
    (0, common_1.Get)(':id/teachers'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách giáo viên của lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách giáo viên' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getTeachersByClass", null);
__decorate([
    (0, common_1.Post)(':id/transfer-teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Chuyển giáo viên cho lớp' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Yêu cầu chuyển giáo viên đã được tạo',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy lớp hoặc giáo viên',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "transferTeacher", null);
__decorate([
    (0, common_1.Get)(':id/transfer-teacher/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Kiểm tra xung đột khi chuyển giáo viên' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kết quả kiểm tra xung đột' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('replacementTeacherId')),
    __param(2, (0, common_1.Query)('effectiveDate')),
    __param(3, (0, common_1.Query)('substituteEndDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "validateTransfer", null);
__decorate([
    (0, common_1.Get)('transfers'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách yêu cầu chuyển giáo viên' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách yêu cầu chuyển giáo viên',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getTransferRequests", null);
__decorate([
    (0, common_1.Post)('transfers/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Duyệt yêu cầu chuyển giáo viên' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Duyệt yêu cầu thành công' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Yêu cầu đã được xử lý hoặc thiếu thông tin',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy yêu cầu' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "approveTransfer", null);
__decorate([
    (0, common_1.Post)('transfers/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Từ chối yêu cầu chuyển giáo viên' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Từ chối yêu cầu thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Yêu cầu đã được xử lý' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy yêu cầu' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "rejectTransfer", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thống kê lớp học (số học sinh, capacity)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thống kê lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy dữ liệu dashboard đầy đủ cho lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)(':id/generate-sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo tự động buổi học cho lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tạo buổi học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "generateSessions", null);
__decorate([
    (0, common_1.Get)(':id/sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách buổi học của lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách buổi học' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getClassSessions", null);
__decorate([
    (0, common_1.Delete)(':id/sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa nhiều buổi học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa buổi học thành công' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Không thể xóa buổi học đã diễn ra',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "deleteSessions", null);
__decorate([
    (0, common_1.Get)('/:teacherId/teacher'),
    (0, swagger_1.ApiParam)({ name: 'teacherId', description: 'ID của giáo viên (UUID)' }),
    (0, swagger_1.ApiOperation)({ summary: '[LEGACY] Lấy danh sách lớp học theo ID giáo viên' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getClassByTeacher", null);
__decorate([
    (0, common_1.Get)('class-by-teacher/:id'),
    (0, swagger_1.ApiOperation)({ summary: '[LEGACY] Lấy chi tiết lớp học theo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chi tiết lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getClassByTeacherId", null);
__decorate([
    (0, common_1.Post)('class-by-teacher'),
    (0, swagger_1.ApiOperation)({ summary: '[LEGACY] Tạo lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lớp học' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "createClassLegacy", null);
exports.ClassManagementController = ClassManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Class Management'),
    (0, common_1.Controller)('classes'),
    __metadata("design:paramtypes", [class_management_service_1.ClassManagementService])
], ClassManagementController);
//# sourceMappingURL=class-management.controller.js.map