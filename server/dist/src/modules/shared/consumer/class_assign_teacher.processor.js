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
exports.ClassAssignTeacherProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const email_util_1 = require("../../../utils/email.util");
const template_class_assign_teacher_template_1 = require("../template-email/template-class-assign-teacher.template");
const template_class_remove_teacher_template_1 = require("../template-email/template-class-remove-teacher.template");
let ClassAssignTeacherProcessor = class ClassAssignTeacherProcessor {
    async handleSendClassAssignTeacherEmail(job) {
        const startTime = Date.now();
        console.log(`📧 [Job ${job.id}] Bắt đầu gửi email phân công lớp học cho giáo viên\n` +
            `   - Giáo viên: ${job.data.teacherName}\n` +
            `   - Lớp học: ${job.data.className}\n` +
            `   - ClassId: ${job.data.classId}`);
        const { to, teacherId, classId, className, teacherName, subject, startDate, schedule, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email giáo viên không hợp lệ');
            }
            const emailHtml = (0, template_class_assign_teacher_template_1.classAssignTeacherEmailTemplate)(teacherName, className, subject, startDate, schedule);
            const emailSubject = `📚 Thông báo phân công lớp học - ${className}`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`✅ [Job ${job.id}] Email phân công lớp đã gửi thành công trong ${duration}ms\n` +
                `   - Giáo viên: ${teacherName}\n` +
                `   - Email: ${to}\n` +
                `   - TeacherId: ${teacherId}\n` +
                `   - ClassId: ${classId}`);
            return {
                success: true,
                message: 'Email sent successfully',
                teacherId,
                classId,
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
    async handleSendClassRemoveTeacherEmail(job) {
        const startTime = Date.now();
        console.log(`📧 [Job ${job.id}] Bắt đầu gửi email hủy phân công lớp học cho giáo viên\n` +
            `   - Giáo viên: ${job.data.teacherName}\n` +
            `   - Lớp học: ${job.data.className}\n` +
            `   - ClassId: ${job.data.classId}`);
        const { to, teacherId, classId, className, teacherName, reason, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email giáo viên không hợp lệ');
            }
            const emailHtml = (0, template_class_remove_teacher_template_1.classRemoveTeacherEmailTemplate)(teacherName, className, reason);
            const emailSubject = `🚫 Thông báo hủy phân công lớp học - ${className}`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`✅ [Job ${job.id}] Email hủy phân công lớp đã gửi thành công trong ${duration}ms\n` +
                `   - Giáo viên: ${teacherName}\n` +
                `   - Email: ${to}\n` +
                `   - TeacherId: ${teacherId}\n` +
                `   - ClassId: ${classId}`);
            return {
                success: true,
                message: 'Email sent successfully',
                teacherId,
                classId,
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
exports.ClassAssignTeacherProcessor = ClassAssignTeacherProcessor;
__decorate([
    (0, bull_1.Process)('send_class_assign_teacher_email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassAssignTeacherProcessor.prototype, "handleSendClassAssignTeacherEmail", null);
__decorate([
    (0, bull_1.Process)('send_class_remove_teacher_email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassAssignTeacherProcessor.prototype, "handleSendClassRemoveTeacherEmail", null);
exports.ClassAssignTeacherProcessor = ClassAssignTeacherProcessor = __decorate([
    (0, bull_1.Processor)('class_assign_teacher')
], ClassAssignTeacherProcessor);
//# sourceMappingURL=class_assign_teacher.processor.js.map