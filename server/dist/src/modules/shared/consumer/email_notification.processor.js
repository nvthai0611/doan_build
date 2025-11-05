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
    async handleSendClassStartingNotification(job) {
        const startTime = Date.now();
        console.log(`📧 [Job ${job.id}] Bắt đầu xử lý email thông báo lớp sắp bắt đầu\n` +
            `   - Lớp: ${job.data.className}\n` +
            `   - Email: ${job.data.to}`);
        const { to, className, classCode, subjectName, gradeName, daysRemaining, startDate, teacherName, roomName, scheduleText, currentStudents, maxStudents, hasTeacher, hasRoom, hasStudents, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email không hợp lệ');
            }
            const warnings = [];
            if (!hasTeacher)
                warnings.push('⚠️ Chưa phân công giáo viên');
            if (!hasRoom)
                warnings.push('⚠️ Chưa phân công phòng học');
            if (!hasStudents)
                warnings.push('⚠️ Chưa có học sinh đăng ký');
            const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .info-item { margin: 10px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📅 Thông báo lớp sắp bắt đầu</h2>
            </div>
            <div class="content">
              <p>Xin chào,</p>
              <p>Lớp học <strong>"${className}"</strong>${classCode ? ` (${classCode})` : ''} sẽ bắt đầu sau <strong>${daysRemaining} ngày</strong> (${startDate}).</p>
              
              <h3>📋 Thông tin lớp học:</h3>
              <div class="info-item"><strong>Môn học:</strong> ${subjectName}</div>
              <div class="info-item"><strong>Khối:</strong> ${gradeName}</div>
              <div class="info-item"><strong>Giáo viên:</strong> ${teacherName}</div>
              <div class="info-item"><strong>Phòng học:</strong> ${roomName}</div>
              <div class="info-item"><strong>Lịch học:</strong> ${scheduleText || 'Chưa cập nhật'}</div>
              <div class="info-item"><strong>Học sinh:</strong> ${currentStudents}/${maxStudents}</div>

              ${warnings.length > 0 ? `
                <div class="warning">
                  <h4>🔔 Cần chuẩn bị:</h4>
                  <ul>
                    ${warnings.map(w => `<li>${w}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              <p>Vui lòng kiểm tra và chuẩn bị các thông tin cần thiết trước khi lớp học bắt đầu.</p>
            </div>
            <div class="footer">
              <p>Đây là email tự động từ hệ thống quản lý trung tâm giáo dục.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            const emailSubject = `📅 Lớp "${className}" sẽ bắt đầu sau ${daysRemaining} ngày`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`✅ [Job ${job.id}] Email đã gửi thành công trong ${duration}ms\n` +
                `   - Lớp: ${className}\n` +
                `   - Email: ${to}`);
            return {
                success: true,
                message: 'Email sent successfully',
                className,
                sentTo: to,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
                `   - Lớp: ${className}\n` +
                `   - Email: ${to}\n` +
                `   - Lỗi: ${error.message}`);
            throw new Error(`Failed to send email to ${to}: ${error.message}`);
        }
    }
    async handleSendClassEndingNotification(job) {
        const startTime = Date.now();
        console.log(`📧 [Job ${job.id}] Bắt đầu xử lý email thông báo lớp sắp kết thúc\n` +
            `   - Lớp: ${job.data.className}\n` +
            `   - Email: ${job.data.to}`);
        const { to, className, classCode, subjectName, gradeName, daysRemaining, endDate, teacherName, roomName, scheduleText, currentStudents, maxStudents, } = job.data;
        try {
            if (!to || !to.includes('@')) {
                throw new Error('Email không hợp lệ');
            }
            const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .info-item { margin: 10px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📅 Thông báo lớp sắp kết thúc</h2>
            </div>
            <div class="content">
              <p>Xin chào,</p>
              <p>Lớp học <strong>"${className}"</strong>${classCode ? ` (${classCode})` : ''} sẽ kết thúc sau <strong>${daysRemaining} ngày</strong> (${endDate}).</p>
              
              <h3>📋 Thông tin lớp học:</h3>
              <div class="info-item"><strong>Môn học:</strong> ${subjectName}</div>
              <div class="info-item"><strong>Khối:</strong> ${gradeName}</div>
              <div class="info-item"><strong>Giáo viên:</strong> ${teacherName}</div>
              <div class="info-item"><strong>Phòng học:</strong> ${roomName}</div>
              <div class="info-item"><strong>Lịch học:</strong> ${scheduleText || 'Chưa cập nhật'}</div>
              <div class="info-item"><strong>Học sinh:</strong> ${currentStudents}/${maxStudents}</div>

              <div class="warning">
                <h4>🔔 Cần chuẩn bị:</h4>
                <ul>
                  <li>Chuẩn bị đánh giá cuối khóa</li>
                  <li>Chuẩn bị chứng chỉ/giấy chứng nhận (nếu có)</li>
                  <li>Thông báo cho phụ huynh về việc kết thúc lớp</li>
                </ul>
              </div>

              <p>Vui lòng chuẩn bị các công việc cần thiết trước khi lớp học kết thúc.</p>
            </div>
            <div class="footer">
              <p>Đây là email tự động từ hệ thống quản lý trung tâm giáo dục.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            const emailSubject = `📅 Lớp "${className}" sẽ kết thúc sau ${daysRemaining} ngày`;
            await (0, email_util_1.default)(to, emailSubject, emailHtml);
            const duration = Date.now() - startTime;
            console.log(`✅ [Job ${job.id}] Email đã gửi thành công trong ${duration}ms\n` +
                `   - Lớp: ${className}\n` +
                `   - Email: ${to}`);
            return {
                success: true,
                message: 'Email sent successfully',
                className,
                sentTo: to,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
                `   - Lớp: ${className}\n` +
                `   - Email: ${to}\n` +
                `   - Lỗi: ${error.message}`);
            throw new Error(`Failed to send email to ${to}: ${error.message}`);
        }
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
__decorate([
    (0, bull_1.Process)('send_class_starting_notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailNotificationProcessor.prototype, "handleSendClassStartingNotification", null);
__decorate([
    (0, bull_1.Process)('send_class_ending_notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailNotificationProcessor.prototype, "handleSendClassEndingNotification", null);
exports.EmailNotificationProcessor = EmailNotificationProcessor = __decorate([
    (0, bull_1.Processor)('email_notification')
], EmailNotificationProcessor);
//# sourceMappingURL=email_notification.processor.js.map