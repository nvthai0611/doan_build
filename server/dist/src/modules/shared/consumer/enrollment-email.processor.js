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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentEmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const email_util_1 = require("../../../utils/email.util");
const template_enrollment_1 = require("../template-email/template-enrollment");
let EnrollmentEmailProcessor = class EnrollmentEmailProcessor {
    async handleSendEnrollmentEmail(job) {
        const startTime = Date.now();
        console.log(`[Job ${job.id}] Bắt đầu xử lý email ${job.data.isTransfer ? 'chuyển lớp' : 'đăng ký lớp'}\n` +
            `   - Học sinh: ${job.data.studentName}\n` +
            `   - Lớp: ${job.data.className}\n` +
            `   - Email: ${job.data.to}`);
        const { to, studentName, parentName, className, subjectName, teacherName, startDate, schedule, enrollmentStatus, studentId, classId, isTransfer, oldClassName, transferReason, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email phụ huynh không hợp lệ');
            }
            const emailHtml = (0, template_enrollment_1.enrollmentNotificationEmailTemplate)({
                studentName,
                parentName,
                className,
                subjectName,
                teacherName,
                startDate,
                schedule,
                enrollmentStatus,
                isTransfer,
                oldClassName,
                transferReason,
            });
            const emailSubject = isTransfer
                ? `Thông báo chuyển lớp - ${studentName} - ${className}`
                : `Thông báo đăng ký lớp - ${studentName} - ${className}`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`[Job ${job.id}] Email ${isTransfer ? 'chuyển lớp' : 'đăng ký lớp'} đã gửi thành công trong ${duration}ms\n` +
                `   - Học sinh: ${studentName}\n` +
                `   - Email phụ huynh: ${to}\n` +
                `   - ClassId: ${classId}\n` +
                `   - StudentId: ${studentId}`);
            return {
                success: true,
                message: 'Enrollment email sent successfully',
                studentId,
                classId,
                sentTo: to,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[Job ${job.id}] Lỗi sau ${duration}ms\n` +
                `   - Học sinh: ${studentName}\n` +
                `   - Email: ${to}\n` +
                `   - Lỗi: ${error.message}\n` +
                `   - Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
            throw new Error(`Failed to send enrollment email to ${to}: ${error.message}`);
        }
    }
};
exports.EnrollmentEmailProcessor = EnrollmentEmailProcessor;
__decorate([
    (0, bull_1.Process)('send_enrollment_notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentEmailProcessor.prototype, "handleSendEnrollmentEmail", null);
exports.EnrollmentEmailProcessor = EnrollmentEmailProcessor = __decorate([
    (0, bull_1.Processor)('enrollment_email')
], EnrollmentEmailProcessor);
//# sourceMappingURL=enrollment-email.processor.js.map