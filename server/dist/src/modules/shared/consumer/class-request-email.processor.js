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
exports.ClassRequestEmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const email_util_1 = require("../../../utils/email.util");
const template_class_request_approval_1 = require("../template-email/template-class-request-approval");
const template_class_request_rejection_1 = require("../template-email/template-class-request-rejection");
let ClassRequestEmailProcessor = class ClassRequestEmailProcessor {
    async handleSendApprovalEmail(job) {
        const startTime = Date.now();
        console.log(`📧 [Job ${job.id}] Bắt đầu xử lý email chấp nhận yêu cầu\n` +
            `   - Học sinh: ${job.data.studentName}\n` +
            `   - Lớp: ${job.data.className}\n` +
            `   - Email: ${job.data.to}`);
        const { to, studentName, parentName, className, subjectName, teacherName, startDate, schedule, username, password, requestId, studentId, classId, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email phụ huynh không hợp lệ');
            }
            const emailHtml = (0, template_class_request_approval_1.classRequestApprovalEmailTemplate)({
                studentName,
                parentName,
                className,
                subjectName,
                teacherName,
                startDate,
                schedule,
                username,
                password,
            });
            const emailSubject = `✅ Yêu cầu tham gia lớp học đã được chấp nhận - ${studentName}`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`✅ [Job ${job.id}] Email chấp nhận đã gửi thành công trong ${duration}ms\n` +
                `   - Học sinh: ${studentName}\n` +
                `   - Email phụ huynh: ${to}\n` +
                `   - RequestId: ${requestId}\n` +
                `   - StudentId: ${studentId}\n` +
                `   - ClassId: ${classId}`);
            return {
                success: true,
                message: 'Approval email sent successfully',
                studentId,
                classId,
                requestId,
                sentTo: to,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
                `   - Học sinh: ${studentName}\n` +
                `   - Email: ${to}\n` +
                `   - Lỗi: ${error.message}\n` +
                `   - Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
            throw new Error(`Failed to send approval email to ${to}: ${error.message}`);
        }
    }
    async handleSendRejectionEmail(job) {
        const startTime = Date.now();
        console.log(`📧 [Job ${job.id}] Bắt đầu xử lý email từ chối yêu cầu\n` +
            `   - Học sinh: ${job.data.studentName}\n` +
            `   - Lớp: ${job.data.className}\n` +
            `   - Email: ${job.data.to}`);
        const { to, studentName, parentName, className, subjectName, reason, requestId, studentId, classId, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email phụ huynh không hợp lệ');
            }
            const emailHtml = (0, template_class_request_rejection_1.classRequestRejectionEmailTemplate)({
                studentName,
                parentName,
                className,
                subjectName,
                reason,
            });
            const emailSubject = `❌ Yêu cầu tham gia lớp học đã bị từ chối - ${studentName}`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`[Job ${job.id}] Email từ chối đã gửi thành công trong ${duration}ms\n` +
                `   - Học sinh: ${studentName}\n` +
                `   - Email phụ huynh: ${to}\n` +
                `   - RequestId: ${requestId}\n` +
                `   - StudentId: ${studentId}\n` +
                `   - ClassId: ${classId}`);
            return {
                success: true,
                message: 'Rejection email sent successfully',
                studentId,
                classId,
                requestId,
                sentTo: to,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
                `   - Học sinh: ${studentName}\n` +
                `   - Email: ${to}\n` +
                `   - Lỗi: ${error.message}\n` +
                `   - Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
            throw new Error(`Failed to send rejection email to ${to}: ${error.message}`);
        }
    }
};
exports.ClassRequestEmailProcessor = ClassRequestEmailProcessor;
__decorate([
    (0, bull_1.Process)('send_approval_notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassRequestEmailProcessor.prototype, "handleSendApprovalEmail", null);
__decorate([
    (0, bull_1.Process)('send_rejection_notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassRequestEmailProcessor.prototype, "handleSendRejectionEmail", null);
exports.ClassRequestEmailProcessor = ClassRequestEmailProcessor = __decorate([
    (0, bull_1.Processor)('class_request_email')
], ClassRequestEmailProcessor);
//# sourceMappingURL=class-request-email.processor.js.map