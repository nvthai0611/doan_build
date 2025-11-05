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
exports.AttendanceController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("../services/attendance.service");
const swagger_1 = require("@nestjs/swagger");
const attendance_response_dto_1 = require("../dto/attendance/attendance-response.dto");
const email_notification_service_1 = require("../../shared/services/email-notification.service");
let AttendanceController = class AttendanceController {
    constructor(attendanceService, emailNotificationService) {
        this.attendanceService = attendanceService;
        this.emailNotificationService = emailNotificationService;
    }
    async getListStudentBySessionId(sessionId) {
        return this.attendanceService.getListStudentBySessionId(sessionId);
    }
    async getLeaveRequestsBySessionId(sessionId) {
        return this.attendanceService.getLeaveRequestsBySessionId(sessionId);
    }
    async checkLeaveRequestsStatus(sessionId) {
        return this.attendanceService.getLeaveRequestsBySessionId(sessionId);
    }
    async getAttendanceBySessionId(sessionId) {
        return this.attendanceService.getAttendanceBySessionId(sessionId);
    }
    async attendanceStudentBySessionId(sessionId, body, req) {
        return this.attendanceService.attendanceStudentBySessionId(sessionId, body.records, req.user.teacherId, req.user.id);
    }
    async sendAbsentNotifications(request, sessionId, body) {
        try {
            const teacherId = request?.user?.teacherId;
            if (!teacherId) {
                throw new common_1.HttpException('Không tìm thấy thông tin giáo viên', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (!body.studentIds || body.studentIds.length === 0) {
                throw new common_1.HttpException('Danh sách học sinh không được để trống', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.emailNotificationService.sendStudentAbsenceEmail(body.studentIds, sessionId, teacherId);
            let message = '';
            if (result.alreadySentCount > 0) {
                message = `Đã gửi ${result.sentCount} email mới. ${result.alreadySentCount} học sinh đã được gửi email trước đó`;
            }
            else {
                message = `Đã gửi ${result.sentCount}/${result.totalStudents} email thông báo vắng học thành công`;
            }
            if (result.failCount > 0) {
                message += `. ${result.failCount} email gửi thất bại`;
            }
            return {
                data: result,
                message
            };
        }
        catch (error) {
            console.error('Error sending absent notifications:', error);
            throw error;
        }
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Get)(':sessionId/students'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách học sinh theo ID buổi học' }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'ID của buổi học',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách học sinh thành công'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Session ID không hợp lệ'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Buổi học không tồn tại'
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getListStudentBySessionId", null);
__decorate([
    (0, common_1.Get)(':sessionId/leave-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách đơn xin nghỉ trong ngày học' }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'ID của buổi học',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách đơn xin nghỉ thành công'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Session ID không hợp lệ'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Buổi học không tồn tại'
    }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getLeaveRequestsBySessionId", null);
__decorate([
    (0, common_1.Get)(':sessionId/leave-requests/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Kiểm tra trạng thái đơn xin nghỉ của buổi học' }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'ID của buổi học',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy trạng thái đơn xin nghỉ thành công',
    }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkLeaveRequestsStatus", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách điểm danh theo ID buổi học' }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'ID của buổi học',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách điểm danh thành công',
        type: attendance_response_dto_1.AttendanceResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Session ID không hợp lệ'
    }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceBySessionId", null);
__decorate([
    (0, common_1.Put)(':sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái điểm danh học sinh' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'ID của buổi học' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                records: [
                    { studentId: 'uuid', status: 'present', note: '' },
                ],
            },
        },
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "attendanceStudentBySessionId", null);
__decorate([
    (0, common_1.Post)(':sessionId/send-absent-notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi email thông báo vắng mặt cho phụ huynh' }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'ID của buổi học',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Gửi email thông báo vắng mặt thành công'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Dữ liệu không hợp lệ'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy buổi học hoặc giáo viên'
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "sendAbsentNotifications", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Teacher - Attendance'),
    (0, common_1.Controller)('attendances'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        email_notification_service_1.EmailNotificationService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map