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
exports.TeacherStudentLeaveRequestController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const student_leave_request_service_1 = require("../services/student-leave-request.service");
const student_leave_request_dto_1 = require("../dto/student-leave-request/student-leave-request.dto");
let TeacherStudentLeaveRequestController = class TeacherStudentLeaveRequestController {
    constructor(studentLeaveRequestService) {
        this.studentLeaveRequestService = studentLeaveRequestService;
    }
    async getStudentLeaveRequests(req, query) {
        try {
            const teacherId = req.user?.teacherId;
            if (!teacherId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin giáo viên' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const queryParams = {
                ...query,
                page: query.page ? Number(query.page) : 1,
                limit: query.limit ? Number(query.limit) : 10,
            };
            const result = await this.studentLeaveRequestService.getStudentLeaveRequests(teacherId, queryParams);
            return {
                success: true,
                ...result,
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
    async getStudentLeaveRequestById(req, id) {
        try {
            const teacherId = req.user?.teacherId;
            if (!teacherId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin giáo viên' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.studentLeaveRequestService.getStudentLeaveRequestById(teacherId, id);
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
    async approveOrRejectStudentLeaveRequest(req, id, action, dto) {
        try {
            const teacherId = req.user?.teacherId;
            if (!teacherId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin giáo viên' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            if (action !== 'approve' && action !== 'reject') {
                throw new common_1.HttpException({ success: false, message: 'Action không hợp lệ' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.studentLeaveRequestService.approveOrRejectStudentLeaveRequest(teacherId, id, action, dto);
            return {
                success: true,
                data: result,
                message: action === 'approve'
                    ? 'Duyệt đơn nghỉ học thành công'
                    : 'Từ chối đơn nghỉ học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xử lý đơn nghỉ học',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TeacherStudentLeaveRequestController = TeacherStudentLeaveRequestController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách đơn nghỉ học của học sinh trong các lớp mình dạy',
    }),
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
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'ID lớp học' }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: 'Tìm kiếm theo tên học sinh',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy danh sách thành công' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, student_leave_request_dto_1.GetStudentLeaveRequestsQueryDto]),
    __metadata("design:returntype", Promise)
], TeacherStudentLeaveRequestController.prototype, "getStudentLeaveRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết đơn nghỉ học của học sinh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy chi tiết thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherStudentLeaveRequestController.prototype, "getStudentLeaveRequestById", null);
__decorate([
    (0, common_1.Patch)(':id/:action'),
    (0, swagger_1.ApiOperation)({ summary: 'Duyệt hoặc từ chối đơn nghỉ học của học sinh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xử lý đơn nghỉ học thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('action')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, student_leave_request_dto_1.ApproveRejectStudentLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], TeacherStudentLeaveRequestController.prototype, "approveOrRejectStudentLeaveRequest", null);
exports.TeacherStudentLeaveRequestController = TeacherStudentLeaveRequestController = __decorate([
    (0, swagger_1.ApiTags)('Teacher - Student Leave Requests'),
    (0, common_1.Controller)('student-leave-requests'),
    __metadata("design:paramtypes", [student_leave_request_service_1.TeacherStudentLeaveRequestService])
], TeacherStudentLeaveRequestController);
//# sourceMappingURL=student-leave-request.controller.js.map