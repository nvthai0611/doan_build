"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailNotificationPayrollService = void 0;
const common_1 = require("@nestjs/common");
const email_util_1 = require("../../../utils/email.util");
let EmailNotificationPayrollService = class EmailNotificationPayrollService {
    async sendPayrollNotificationEmail(payload) {
        const { teacherName, teacherEmail, payrollInfo, payrollId } = payload;
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thông báo Bảng Lương</h2>
        
        <p>Xin chào ${teacherName},</p>
        
        <p>Bảng lương của bạn đã được chuẩn bị và chờ kiểm tra:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Khoảng thời gian</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${payrollInfo.period}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Tổng tiền</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; color: #27ae60; font-weight: bold;">
              ${this.formatCurrency(payrollInfo.totalAmount)} VND
            </td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Thưởng</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${this.formatCurrency(payrollInfo.bonuses)} VND</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Khấu trừ</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${this.formatCurrency(payrollInfo.deductions)} VND</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Trạng thái</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">⏳ Chờ xác nhận</td>
          </tr>
        </table>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Vui lòng kiểm tra thông tin và <strong>xác nhận hoặc từ chối</strong> bảng lương này trong hệ thống.<br>
          Nếu có thắc mắc, vui lòng liên hệ trung tâm.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          © 2025 QNEdu Center. Đây là email tự động, vui lòng không trả lời.
        </p>
      </div>
    `;
        await (0, email_util_1.default)(teacherEmail, 'Thông báo Bảng Lương của bạn đã có', htmlContent);
    }
    async sendPaymentConfirmationEmail(payload) {
        const { teacherName, teacherEmail, paymentInfo } = payload;
        const paymentMethodMap = {
            cash: '💵 Tiền mặt',
            bank_transfer: '🏦 Chuyển khoản ngân hàng',
            momo: '📱 Ví MoMo',
            zalo_pay: '💳 ZaloPay'
        };
        const methodDisplay = paymentMethodMap[paymentInfo.paymentMethod] || paymentInfo.paymentMethod;
        const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #10b981; padding: 30px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0; text-align: center;">
          💰 Xác Nhận Thanh Toán Lương
        </h2>
      </div>
      
      <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; color: #374151;">Kính gửi <strong>${teacherName}</strong>,</p>
        
        <p style="color: #4b5563; line-height: 1.6;">
          Trung tâm xin thông báo rằng chúng tôi đã <strong style="color: #059669;">hoàn tất thanh toán lương</strong> 
          cho bạn với thông tin chi tiết như sau:
        </p>

        <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
            📋 Thông Tin Thanh Toán
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 0; color: #6b7280;">Mã giao dịch</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937;">
                #${paymentInfo.paymentId}
              </td>
            </tr>
            
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 0; color: #6b7280;">Phương thức thanh toán</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937;">
                ${methodDisplay}
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 0; color: #6b7280;">Ngày thanh toán</td>
              <td style="padding: 12px 0; text-align: right; color: #4b5563;">
                ${new Date(paymentInfo.paidAt).toLocaleString('vi-VN')}
              </td>
            </tr>

            ${paymentInfo.notes ? `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 0; color: #6b7280;">Ghi chú</td>
              <td style="padding: 12px 0; text-align: right; color: #4b5563; font-style: italic;">
                ${paymentInfo.notes}
              </td>
            </tr>
            ` : ''}

            <tr style="background-color: #ecfdf5; border-top: 2px solid #10b981;">
              <td style="padding: 15px 10px; color: #065f46; font-weight: bold;">
                💰 Tổng số tiền nhận được
              </td>
              <td style="padding: 15px 10px; text-align: right; font-size: 24px; font-weight: bold; color: #059669;">
                ${this.formatCurrency(paymentInfo.totalAmount)} đ
              </td>
            </tr>
          </table>
        </div>

        ${paymentInfo.payrollDetails.length > 0 ? `
        <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            📊 Chi Tiết Bảng Lương ${paymentInfo.payRate ? `(Tỷ lệ: ${paymentInfo.payRate})` : ''}
          </h3>
          
          ${paymentInfo.payrollDetails.map((detail, index) => `
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 6px; padding: 15px; margin-bottom: ${index === paymentInfo.payrollDetails.length - 1 ? '0' : '15px'};">
              <tr>
                <td style="padding-bottom: 10px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-weight: 600; color: #1f2937;">Ngày tháng: ${detail.period}</td>
                      <td style="font-weight: 700; color: #059669; font-size: 16px; text-align: right;">
                        ${this.formatCurrency(detail.amount)} đ
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                    ${paymentInfo.totalPayoutInClass ? `
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">• Lương thực thu của lớp:</td>
                      <td style="padding: 4px 0; text-align: right; color: #8b5cf6;">
                        +${this.formatCurrency(paymentInfo.totalPayoutInClass)} đ
                      </td>
                    </tr>
                    ` : ""}
                    ${detail.backPayAmount > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">• Lương buổi học cũ:</td>
                      <td style="padding: 4px 0; text-align: right; color: #8b5cf6;">
                        +${this.formatCurrency(detail.backPayAmount)} đ
                      </td>
                    </tr>
                    ` : ''}
                    
                    ${detail.bonuses > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">• Thưởng:</td>
                      <td style="padding: 4px 0; text-align: right; color: #10b981;">
                        +${this.formatCurrency(detail.bonuses)} đ
                      </td>
                    </tr>
                    ` : ''}
                    
                    ${detail.deductions > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">• Khấu trừ:</td>
                      <td style="padding: 4px 0; text-align: right; color: #ef4444;">
                        -${this.formatCurrency(detail.deductions)} đ
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>
            </table>
          `).join('')}
        </div>
        ` : ''}

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>✅ Trạng thái thanh toán:</strong><br>
            - Giao dịch đã được xử lý thành công<br>
            - Vui lòng kiểm tra và xác nhận đã nhận được tiền<br>
            - Nếu có thắc mắc, vui lòng liên hệ bộ phận kế toán
          </p>
        </div>

        <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #854d0e; font-size: 13px;">
            <strong>⚠️ Lưu ý quan trọng:</strong><br>
            - Vui lòng lưu giữ email này để đối chiếu<br>
            - Mọi thắc mắc về lương, vui lòng liên hệ trong vòng 7 ngày<br>
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Trân trọng cảm ơn sự cống hiến của bạn!<br>
          <strong style="color: #1f2937;">Ban Giám Hiệu - QNEdu Center</strong>
        </p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
          © 2025 QNEdu Center. Mọi quyền được bảo lưu.
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin: 5px 0;">
          Đây là email tự động xác nhận thanh toán. Vui lòng không trả lời trực tiếp.
        </p>
      </div>
    </div>
  `;
        await (0, email_util_1.default)(teacherEmail, `💰 Xác nhận thanh toán lương - ${this.formatCurrency(paymentInfo.totalAmount)} đ`, htmlContent);
    }
    formatCurrency(amount) {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN').format(num);
    }
};
exports.EmailNotificationPayrollService = EmailNotificationPayrollService;
exports.EmailNotificationPayrollService = EmailNotificationPayrollService = __decorate([
    (0, common_1.Injectable)()
], EmailNotificationPayrollService);
//# sourceMappingURL=email-notification-payroll.service.js.map