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
exports.TeacherFeedbackMonitoringController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const teacher_feedback_monitoring_service_1 = require("../services/teacher-feedback-monitoring.service");
const prisma_service_1 = require("../../../db/prisma.service");
let TeacherFeedbackMonitoringController = class TeacherFeedbackMonitoringController {
    constructor(feedbackMonitoringService, prisma) {
        this.feedbackMonitoringService = feedbackMonitoringService;
        this.prisma = prisma;
    }
    async checkTeacher(teacherId, query) {
        try {
            const result = await this.feedbackMonitoringService.checkTeacherFeedbackThresholds(teacherId, {
                classId: query.classId,
                periodDays: query.periodDays
                    ? parseInt(query.periodDays.toString())
                    : undefined,
            });
            return {
                success: true,
                data: result,
                message: 'Kiểm tra feedback thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi kiểm tra feedback',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTeachersAtRisk(query) {
        return this.feedbackMonitoringService.getTeachersAtRisk(query);
    }
    async updateAutoTransferSettings(body, req) {
        try {
            const updatedBy = req.user?.userId;
            if (!updatedBy) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không xác định được người cập nhật',
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const setting = await this.prisma.systemSetting.upsert({
                where: { key: 'feedback_transfer_thresholds' },
                update: {
                    value: body,
                    updatedBy: updatedBy,
                },
                create: {
                    key: 'feedback_transfer_thresholds',
                    group: 'feedback',
                    value: body,
                    description: 'Cài đặt ngưỡng tự động chuyển giáo viên dựa trên feedback',
                    updatedBy: updatedBy,
                },
            });
            return {
                success: true,
                data: setting,
                message: 'Cập nhật cài đặt thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật cài đặt',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async monitorAll() {
        return this.feedbackMonitoringService.monitorAllTeachers();
    }
    async getTeacherFeedbacksForReview(teacherId, query) {
        return this.feedbackMonitoringService.getTeacherFeedbacksForReview(teacherId, {
            classId: query.classId,
            periodDays: query.periodDays
                ? parseInt(query.periodDays.toString())
                : undefined,
            page: query.page ? parseInt(query.page.toString()) : undefined,
            limit: query.limit ? parseInt(query.limit.toString()) : undefined,
        });
    }
};
exports.TeacherFeedbackMonitoringController = TeacherFeedbackMonitoringController;
__decorate([
    (0, common_1.Post)('check-teacher/:teacherId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Kiểm tra feedback của giáo viên (manual check)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Kết quả kiểm tra feedback',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeacherFeedbackMonitoringController.prototype, "checkTeacher", null);
__decorate([
    (0, common_1.Get)('teachers-at-risk'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách giáo viên có nguy cơ' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách giáo viên có nguy cơ',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherFeedbackMonitoringController.prototype, "getTeachersAtRisk", null);
__decorate([
    (0, common_1.Post)('auto-transfer-settings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật cài đặt tự động chuyển giáo viên' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cập nhật cài đặt thành công',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherFeedbackMonitoringController.prototype, "updateAutoTransferSettings", null);
__decorate([
    (0, common_1.Post)('monitor-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Monitor tất cả giáo viên (chỉ để hiển thị cảnh báo)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Monitor thành công',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeacherFeedbackMonitoringController.prototype, "monitorAll", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId/feedbacks'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách feedbacks của giáo viên để center owner review',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách feedbacks kèm metrics',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeacherFeedbackMonitoringController.prototype, "getTeacherFeedbacksForReview", null);
exports.TeacherFeedbackMonitoringController = TeacherFeedbackMonitoringController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Teacher Feedback Monitoring'),
    (0, common_1.Controller)('admin-center/feedback-monitoring'),
    __metadata("design:paramtypes", [teacher_feedback_monitoring_service_1.TeacherFeedbackMonitoringService,
        prisma_service_1.PrismaService])
], TeacherFeedbackMonitoringController);
//# sourceMappingURL=teacher-feedback-monitoring.controller.js.map