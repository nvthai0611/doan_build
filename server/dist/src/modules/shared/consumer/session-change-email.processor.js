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
exports.SessionChangeEmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const email_util_1 = require("../../../utils/email.util");
const template_session_change_1 = require("../template-email/template-session-change");
let SessionChangeEmailProcessor = class SessionChangeEmailProcessor {
    async handleSessionChange(job) {
        const start = Date.now();
        const { to, type, parentName, studentNames, className, subjectName, teacherName, originalDate, originalTime, newDate, newTime, reason, sessionId, classId, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email phụ huynh không hợp lệ');
            }
            const html = (0, template_session_change_1.sessionChangeEmailTemplate)({
                type,
                parentName,
                studentNames,
                className,
                subjectName,
                teacherName,
                originalDate,
                originalTime,
                newDate,
                newTime,
                reason,
            });
            const subject = type === 'cancelled'
                ? `Thông báo nghỉ buổi học - ${className}`
                : `Cập nhật lịch buổi học - ${className}`;
            await (0, email_util_1.default)(to, subject, html);
            const duration = Date.now() - start;
            console.log(`[SessionChangeEmail] Job ${job.id} thành công sau ${duration}ms - session ${sessionId}`);
            return {
                success: true,
                sessionId,
                classId,
                sentTo: to,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            console.error(`[SessionChangeEmail] Job ${job.id} thất bại sau ${duration}ms: ${error.message}`);
            throw new Error(`Failed to send session change email to ${to}: ${error.message}`);
        }
    }
};
exports.SessionChangeEmailProcessor = SessionChangeEmailProcessor;
__decorate([
    (0, bull_1.Process)('send_session_change_notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionChangeEmailProcessor.prototype, "handleSessionChange", null);
exports.SessionChangeEmailProcessor = SessionChangeEmailProcessor = __decorate([
    (0, bull_1.Processor)('session_change_email')
], SessionChangeEmailProcessor);
//# sourceMappingURL=session-change-email.processor.js.map