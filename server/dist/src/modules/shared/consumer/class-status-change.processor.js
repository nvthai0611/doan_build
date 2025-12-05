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
exports.ClassStatusChangeProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const email_util_1 = require("../../../utils/email.util");
const template_class_status_change_1 = require("../template-email/template-class-status-change");
let ClassStatusChangeProcessor = class ClassStatusChangeProcessor {
    async handleSendClassStatusChangeEmail(job) {
        const startTime = Date.now();
        console.log(`[Job ${job.id}] Bắt đầu xử lý email thông báo thay đổi status lớp\n` +
            `   - Học sinh: ${job.data.studentName}\n` +
            `   - Lớp: ${job.data.className}\n` +
            `   - Status: ${job.data.oldStatus} -> ${job.data.newStatus}\n` +
            `   - Email: ${job.data.to}`);
        const { to, parentName, studentName, className, subjectName, teacherName, oldStatus, newStatus, statusLabel, statusIcon, classId, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email phụ huynh không hợp lệ');
            }
            const emailHtml = (0, template_class_status_change_1.classStatusChangeEmailTemplate)({
                parentName,
                studentName,
                className,
                subjectName,
                teacherName,
                oldStatus,
                newStatus,
                statusLabel,
                statusColor: '',
                statusIcon,
            });
            const emailSubject = `${statusIcon} Thông báo thay đổi trạng thái lớp học - ${className}`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`[Job ${job.id}] Email thông báo status đã gửi thành công trong ${duration}ms\n` +
                `   - Học sinh: ${studentName}\n` +
                `   - Email phụ huynh: ${to}\n` +
                `   - ClassId: ${classId}`);
            return {
                success: true,
                message: 'Class status change email sent successfully',
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
            throw new Error(`Failed to send class status change email to ${to}: ${error.message}`);
        }
    }
};
exports.ClassStatusChangeProcessor = ClassStatusChangeProcessor;
__decorate([
    (0, bull_1.Process)('send_class_status_change_notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassStatusChangeProcessor.prototype, "handleSendClassStatusChangeEmail", null);
exports.ClassStatusChangeProcessor = ClassStatusChangeProcessor = __decorate([
    (0, bull_1.Processor)('class_status_change_email')
], ClassStatusChangeProcessor);
//# sourceMappingURL=class-status-change.processor.js.map