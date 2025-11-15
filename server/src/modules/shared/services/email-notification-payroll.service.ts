import { Injectable } from '@nestjs/common';
import emailUtil from 'src/utils/email.util';
// import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailNotificationPayrollService {
  // constructor(private readonly mailerService: MailerService) {}

  async sendPayrollNotificationEmail(payload: {
    teacherName: string;
    teacherEmail: string;
    payrollInfo: {
      period: string;
      totalAmount: string;
      bonuses: string;
      deductions: string;
      status: string;
    };
    payrollId: string;
  }) {
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

    await emailUtil(
      teacherEmail,
      'Thông báo Bảng Lương của bạn đã có',
      htmlContent,
    )
  }

  private formatCurrency(amount: string | number): string {
    return new Intl.NumberFormat('vi-VN').format(Number(amount));
  }
}