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
exports.ChildTeacherFeedbackController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const child_teacher_feedback_service_1 = require("../services/child-teacher-feedback.service");
let ChildTeacherFeedbackController = class ChildTeacherFeedbackController {
    constructor(service) {
        this.service = service;
    }
    async getTeachers(req, childId) {
        const parentUserId = req.user?.userId;
        if (!parentUserId)
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
        if (!childId)
            throw new common_1.HttpException({ success: false, message: 'Thiếu tham số childId' }, common_1.HttpStatus.BAD_REQUEST);
        const data = await this.service.getAvailableTeachersForChild(parentUserId, String(childId));
        return { success: true, data, message: 'Lấy danh sách giáo viên thành công' };
    }
    async getFeedbacks(req, childId) {
        const parentUserId = req.user?.userId;
        if (!parentUserId)
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
        const data = await this.service.getFeedbacksForChild(parentUserId, String(childId));
        return { success: true, data, message: 'Lấy lịch sử phản hồi thành công' };
    }
    async createFeedback(req, childId, body) {
        const parentUserId = req.user?.userId;
        if (!parentUserId)
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
        const data = await this.service.createFeedbackForChild(parentUserId, String(childId), body);
        return { success: true, data, message: 'Gửi phản hồi thành công' };
    }
};
exports.ChildTeacherFeedbackController = ChildTeacherFeedbackController;
__decorate([
    (0, common_1.Get)('teachers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChildTeacherFeedbackController.prototype, "getTeachers", null);
__decorate([
    (0, common_1.Get)(':childId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChildTeacherFeedbackController.prototype, "getFeedbacks", null);
__decorate([
    (0, common_1.Post)(':childId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('childId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChildTeacherFeedbackController.prototype, "createFeedback", null);
exports.ChildTeacherFeedbackController = ChildTeacherFeedbackController = __decorate([
    (0, common_1.Controller)('teacher-feedback'),
    __metadata("design:paramtypes", [child_teacher_feedback_service_1.ChildTeacherFeedbackService])
], ChildTeacherFeedbackController);
//# sourceMappingURL=child-teacher-feedback.controller.js.map