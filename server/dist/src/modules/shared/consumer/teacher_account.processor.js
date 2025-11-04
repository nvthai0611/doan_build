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
exports.TeacherAccountProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const email_util_1 = require("../../../utils/email.util");
const teacher_account_template_1 = require("../template-email/teacher-account-template");
let TeacherAccountProcessor = class TeacherAccountProcessor {
    async handleSendTeacherAccountEmail(job) {
        const startTime = Date.now();
        console.log(`📧 [Job ${job.id}] Bắt đầu gửi email tài khoản giáo viên\n` +
            `   - Giáo viên: ${job.data.teacherName}\n` +
            `   - Email: ${job.data.to}`);
        const { to, teacherName, username, email, password, teacherCode, teacherId, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email giáo viên không hợp lệ');
            }
            const emailHtml = (0, teacher_account_template_1.teacherAccountEmailTemplate)(teacherName, username, email, password, teacherCode);
            const emailSubject = `🎓 Chào mừng đến với Trung tâm - Thông tin tài khoản của bạn`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`✅ [Job ${job.id}] Email tài khoản đã gửi thành công trong ${duration}ms\n` +
                `   - Giáo viên: ${teacherName}\n` +
                `   - Email: ${to}\n` +
                `   - TeacherId: ${teacherId}`);
            return {
                success: true,
                message: 'Email sent successfully',
                teacherId,
                sentTo: to,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
                `   - Giáo viên: ${teacherName}\n` +
                `   - Email: ${to}\n` +
                `   - Lỗi: ${error.message}\n` +
                `   - Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
            throw new Error(`Failed to send email to ${to}: ${error.message}`);
        }
    }
};
exports.TeacherAccountProcessor = TeacherAccountProcessor;
__decorate([
    (0, bull_1.Process)('send_teacher_account_email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherAccountProcessor.prototype, "handleSendTeacherAccountEmail", null);
exports.TeacherAccountProcessor = TeacherAccountProcessor = __decorate([
    (0, bull_1.Processor)('teacher_account')
], TeacherAccountProcessor);
//# sourceMappingURL=teacher_account.processor.js.map