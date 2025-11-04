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
exports.EmailNotificationProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const email_util_1 = require("../../../utils/email.util");
const template_notification_1 = require("../template-email/template-notification");
let EmailNotificationProcessor = class EmailNotificationProcessor {
    async handleSendStudentAbsenceEmail(job) {
        const startTime = Date.now();
        console.log(`📧 [Job ${job.id}] Bắt đầu xử lý email thông báo vắng mặt\n` +
            `   - Học sinh: ${job.data.studentName}\n` +
            `   - Lớp: ${job.data.className}\n` +
            `   - Email: ${job.data.to}`);
        const { to, studentName, className, absenceDate, sessionTime, subject, teacherName, note, sessionId, studentId, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email phụ huynh không hợp lệ');
            }
            const emailHtml = (0, template_notification_1.studentAbsenceEmailTemplate)(studentName, className, absenceDate, sessionTime, subject, teacherName, note);
            const emailSubject = `⚠️ Thông báo vắng học - ${studentName} - ${className}`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`✅ [Job ${job.id}] Email đã gửi thành công trong ${duration}ms\n` +
                `   - Học sinh: ${studentName}\n` +
                `   - Email phụ huynh: ${to}\n` +
                `   - SessionId: ${sessionId}\n` +
                `   - StudentId: ${studentId}`);
            return {
                success: true,
                message: 'Email sent successfully',
                studentId,
                sessionId,
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
            throw new Error(`Failed to send email to ${to}: ${error.message}`);
        }
    }
    async handleSendBatchAbsenceEmails(job) {
        const startTime = Date.now();
        const { emails } = job.data;
        console.log(`📧 [Batch Job ${job.id}] Bắt đầu gửi ${emails.length} email thông báo vắng mặt`);
        const results = {
            success: [],
            failed: [],
            total: emails.length,
        };
        for (const emailData of emails) {
            try {
                const emailHtml = (0, template_notification_1.studentAbsenceEmailTemplate)(emailData.studentName, emailData.className, emailData.absenceDate, emailData.sessionTime, emailData.subject, emailData.teacherName, emailData.note);
                const emailSubject = `⚠️ Thông báo vắng học - ${emailData.studentName} - ${emailData.className}`;
                await (0, email_util_1.default)(emailData.to, emailSubject, emailHtml);
                results.success.push({
                    studentId: emailData.studentId,
                    studentName: emailData.studentName,
                    email: emailData.to,
                });
                console.log(`✅ Đã gửi email cho ${emailData.studentName}`);
            }
            catch (error) {
                results.failed.push({
                    studentId: emailData.studentId,
                    studentName: emailData.studentName,
                    email: emailData.to,
                    error: error.message,
                });
                console.error(`❌ Lỗi khi gửi email cho ${emailData.studentName}: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const duration = Date.now() - startTime;
        console.log(`📊 [Batch Job ${job.id}] Hoàn thành trong ${duration}ms\n` +
            `   - Thành công: ${results.success.length}/${results.total}\n` +
            `   - Thất bại: ${results.failed.length}/${results.total}`);
        return results;
    }
};
exports.EmailNotificationProcessor = EmailNotificationProcessor;
__decorate([
    (0, bull_1.Process)('send_student_absence_email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailNotificationProcessor.prototype, "handleSendStudentAbsenceEmail", null);
__decorate([
    (0, bull_1.Process)('send_batch_absence_emails'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailNotificationProcessor.prototype, "handleSendBatchAbsenceEmails", null);
exports.EmailNotificationProcessor = EmailNotificationProcessor = __decorate([
    (0, bull_1.Processor)('email_notification')
], EmailNotificationProcessor);
//# sourceMappingURL=email_notification.processor.js.map