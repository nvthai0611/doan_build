"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailServiceNotificationBill_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailServiceNotificationBill = void 0;
const common_1 = require("@nestjs/common");
const email_util_1 = require("../../../utils/email.util");
let EmailServiceNotificationBill = EmailServiceNotificationBill_1 = class EmailServiceNotificationBill {
    constructor() {
        this.logger = new common_1.Logger(EmailServiceNotificationBill_1.name);
    }
    async sendFeeReminderEmail(params) {
        const { type, parentEmail, parentName, feeRecords, dueDate } = params;
        const totalAmount = feeRecords.reduce((sum, fee) => sum + Number(fee.totalAmount || 0), 0);
        const subject = type === 'early'
            ? `🔔 Nhắc nhở: Hóa đơn học phí tháng ${dueDate.getMonth() + 1}`
            : `⚠️ HẠN CUỐI: Hóa đơn học phí đến hạn hôm nay`;
        const htmlContent = this.generateEmailHTML({
            type,
            parentName,
            feeRecords,
            dueDate,
            totalAmount,
        });
        try {
            await (0, email_util_1.default)(parentEmail, subject, htmlContent);
            this.logger.log(`📧 Email sent to ${parentEmail}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${parentEmail}`, error);
            throw error;
        }
    }
    generateEmailHTML(params) {
        const { type, parentName, feeRecords, dueDate, totalAmount } = params;
        const isUrgent = type === 'due';
        const headerColor = isUrgent ? '#dc2626' : '#2563eb';
        const headerText = isUrgent
            ? '⚠️ HẠN CUỐI ĐÓNG HỌC PHÍ'
            : '🔔 NHẮC NHỞ ĐÓNG HỌC PHÍ';
        const feeRowsHTML = feeRecords
            .map((fee) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${fee.student.user.fullName}</strong>
        <br/>
        <span style="color: #6b7280; font-size: 14px;">
          ${fee.class?.name || 'N/A'} - ${fee.class?.subject?.name || ''}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <strong style="color: ${headerColor};">${this.formatCurrency(Number(fee.totalAmount || 0))}</strong>
        <br/>
        <span style="color: #6b7280; font-size: 14px;">
          ${fee.status === 'overdue' ? '❌ Quá hạn' : '⏳ Chờ thanh toán'}
        </span>
      </td>
    </tr>
  `)
            .join('');
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                ${headerText}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Kính gửi <strong>${parentName}</strong>,
              </p>
              
              ${isUrgent
            ? `
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                  <p style="margin: 0; color: #991b1b; font-weight: 600;">
                    ⚠️ Hôm nay là hạn cuối đóng học phí!
                  </p>
                  <p style="margin: 8px 0 0; color: #7f1d1d; font-size: 14px;">
                    Vui lòng thanh toán ngay để tránh ảnh hưởng đến việc học của con.
                  </p>
                </div>
              `
            : `
                <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px;">
                  Đây là thông báo nhắc nhở về hóa đơn học phí sắp đến hạn. 
                  Hạn thanh toán: <strong style="color: ${headerColor};">${this.formatDate(dueDate)}</strong>
                </p>
              `}

              <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px;">
                📋 Chi tiết hóa đơn:
              </h3>

              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">
                      Học sinh / Lớp
                    </th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${feeRowsHTML}
                </tbody>
                <tfoot>
                  <tr style="background-color: #f9fafb;">
                    <td style="padding: 16px; text-align: right; font-weight: 600; color: #111827; font-size: 16px;">
                      TỔNG CỘNG:
                    </td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; color: ${headerColor}; font-size: 18px;">
                      ${this.formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div style="margin-top: 32px; padding: 20px; background-color: #f0f9ff; border-radius: 6px; border-left: 4px solid #0284c7;">
                <h4 style="margin: 0 0 12px; color: #0c4a6e;">💳 Hướng dẫn thanh toán:</h4>
                <ol style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                  <li style="margin-bottom: 8px;">Đăng nhập vào hệ thống phụ huynh</li>
                  <li style="margin-bottom: 8px;">Chọn mục "Hóa đơn" → "Thanh toán"</li>
                  <li style="margin-bottom: 8px;">Quét mã QR hoặc chuyển khoản theo thông tin</li>
                  <li>Lưu lại biên lai để đối chiếu</li>
                </ol>
              </div>

              <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Nếu quý phụ huynh đã thanh toán, vui lòng bỏ qua email này. 
                Mọi thắc mắc xin liên hệ:
                <br/>
                📞 Hotline: <strong>0382657962</strong>
                <br/>
                📧 Email: <strong>support@qne.edu.vn</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #374151; font-weight: 600; font-size: 14px;">
                QNEdu Center
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                Thủy Nguyên - Hải Phòng
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    }
    formatDate(date) {
        return new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    }
};
exports.EmailServiceNotificationBill = EmailServiceNotificationBill;
exports.EmailServiceNotificationBill = EmailServiceNotificationBill = EmailServiceNotificationBill_1 = __decorate([
    (0, common_1.Injectable)()
], EmailServiceNotificationBill);
//# sourceMappingURL=email-notification-bill.service.js.map