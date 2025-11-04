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
exports.StudentLeaveRequestController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const student_leave_request_service_1 = require("../services/student-leave-request.service");
const student_leave_request_dto_1 = require("../dto/student-leave-request/student-leave-request.dto");
let StudentLeaveRequestController = class StudentLeaveRequestController {
    constructor(studentLeaveRequestService) {
        this.studentLeaveRequestService = studentLeaveRequestService;
    }
    async getStudentLeaveRequests(req, query) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const queryParams = {
                ...query,
                page: query.page ? Number(query.page) : 1,
                limit: query.limit ? Number(query.limit) : 10,
            };
            const result = await this.studentLeaveRequestService.getStudentLeaveRequests(parentUserId, queryParams);
            return {
                success: true,
                data: result,
                message: 'Lấy danh sách đơn nghỉ học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách đơn nghỉ học',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAffectedSessions(query) {
        try {
            const result = await this.studentLeaveRequestService.getAffectedSessions(query);
            return {
                success: true,
                data: result,
                message: 'Lấy danh sách buổi học bị ảnh hưởng thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách buổi học bị ảnh hưởng',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStudentLeaveRequestById(req, id) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.studentLeaveRequestService.getStudentLeaveRequestById(parentUserId, id);
            return {
                success: true,
                data: result,
                message: 'Lấy chi tiết đơn nghỉ học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy chi tiết đơn nghỉ học',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createStudentLeaveRequest(req, dto) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.studentLeaveRequestService.createStudentLeaveRequest(parentUserId, dto);
            return {
                success: true,
                data: result,
                message: 'Tạo đơn nghỉ học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi tạo đơn nghỉ học',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStudentLeaveRequest(req, id, dto) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.studentLeaveRequestService.updateStudentLeaveRequest(parentUserId, id, dto);
            return {
                success: true,
                data: result,
                message: 'Cập nhật đơn nghỉ học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật đơn nghỉ học',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cancelStudentLeaveRequest(req, id) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            await this.studentLeaveRequestService.cancelStudentLeaveRequest(parentUserId, id);
            return {
                success: true,
                message: 'Hủy đơn nghỉ học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi hủy đơn nghỉ học',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StudentLeaveRequestController = StudentLeaveRequestController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách đơn nghỉ học của học sinh' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Trang hiện tại' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Số lượng mỗi trang',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Trạng thái (pending, approved, rejected, cancelled)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: false, description: 'ID học sinh' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'ID lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy danh sách thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, student_leave_request_dto_1.GetStudentLeaveRequestsQueryDto]),
    __metadata("design:returntype", Promise)
], StudentLeaveRequestController.prototype, "getStudentLeaveRequests", null);
__decorate([
    (0, common_1.Get)('affected-sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy các buổi học bị ảnh hưởng trong khoảng thời gian nghỉ (tất cả lớp của học sinh)' }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: true, description: 'ID học sinh' }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: true,
        description: 'Ngày bắt đầu (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: true,
        description: 'Ngày kết thúc (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy danh sách buổi học thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [student_leave_request_dto_1.GetAffectedSessionsQueryDto]),
    __metadata("design:returntype", Promise)
], StudentLeaveRequestController.prototype, "getAffectedSessions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết đơn nghỉ học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy chi tiết thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy đơn nghỉ học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentLeaveRequestController.prototype, "getStudentLeaveRequestById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo đơn nghỉ học mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tạo đơn thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, student_leave_request_dto_1.CreateStudentLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], StudentLeaveRequestController.prototype, "createStudentLeaveRequest", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật đơn nghỉ học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật thành công' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Chỉ có thể sửa đơn đang chờ duyệt',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, student_leave_request_dto_1.UpdateStudentLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], StudentLeaveRequestController.prototype, "updateStudentLeaveRequest", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Hủy đơn nghỉ học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hủy đơn thành công' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Chỉ có thể hủy đơn đang chờ duyệt',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentLeaveRequestController.prototype, "cancelStudentLeaveRequest", null);
exports.StudentLeaveRequestController = StudentLeaveRequestController = __decorate([
    (0, swagger_1.ApiTags)('Parent - Student Leave Requests'),
    (0, common_1.Controller)('student-leave-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [student_leave_request_service_1.StudentLeaveRequestService])
], StudentLeaveRequestController);
//# sourceMappingURL=student-leave-request.controller.js.map