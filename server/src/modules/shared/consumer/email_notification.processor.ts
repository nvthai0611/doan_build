import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import emailUtil from '../../../utils/email.util';
import { studentAbsenceEmailTemplate } from '../template-email/template-notification';

interface StudentAbsenceEmailData {
  to: string;
  studentName: string;
  className: string;
  absenceDate: string;
  sessionTime?: string;
  subject?: string;
  teacherName?: string;
  note?: string;
  sessionId: string;
  studentId: string;
}

@Processor('email_notification')
export class EmailNotificationProcessor {
  /**
   * Xử lý gửi email thông báo vắng mặt cho từng học sinh
   * Job này sẽ được thêm vào queue cho mỗi học sinh vắng mặt
   */
  @Process('send_student_absence_email')
  async handleSendStudentAbsenceEmail(job: Job<StudentAbsenceEmailData>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu xử lý email thông báo vắng mặt\n` +
      `   - Học sinh: ${job.data.studentName}\n` +
      `   - Lớp: ${job.data.className}\n` +
      `   - Email: ${job.data.to}`
    );
    
    const {
      to,
      studentName,
      className,
      absenceDate,
      sessionTime,
      subject,
      teacherName,
      note,
      sessionId,
      studentId,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email phụ huynh không hợp lệ');
      }

      // Tạo email template
      const emailHtml = studentAbsenceEmailTemplate(
        studentName,
        className,
        absenceDate,
        sessionTime,
        subject,
        teacherName,
        note
      );

      // Subject cho email
      const emailSubject = `⚠️ Thông báo vắng học - ${studentName} - ${className}`;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `✅ [Job ${job.id}] Email đã gửi thành công trong ${duration}ms\n` +
        `   - Học sinh: ${studentName}\n` +
        `   - Email phụ huynh: ${to}\n` +
        `   - SessionId: ${sessionId}\n` +
        `   - StudentId: ${studentId}`
      );

      return {
        success: true,
        message: 'Email sent successfully',
        studentId,
        sessionId,
        sentTo: to,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(
        `❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
        `   - Học sinh: ${studentName}\n` +
        `   - Email: ${to}\n` +
        `   - Lỗi: ${error.message}\n` +
        `   - Attempts: ${job.attemptsMade}/${job.opts.attempts}`
      );

      // Throw error để Bull retry job theo config
      throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  /**
   * Xử lý batch gửi nhiều email cùng lúc (optional - nếu cần)
   * Có thể sử dụng khi muốn gửi nhiều email trong 1 job
   */
  @Process('send_batch_absence_emails')
  async handleSendBatchAbsenceEmails(
    job: Job<{ emails: StudentAbsenceEmailData[] }>
  ) {
    const startTime = Date.now();
    const { emails } = job.data;
    
    console.log(
      `📧 [Batch Job ${job.id}] Bắt đầu gửi ${emails.length} email thông báo vắng mặt`
    );

    const results = {
      success: [],
      failed: [],
      total: emails.length,
    };

    // Gửi từng email
    for (const emailData of emails) {
      try {
        const emailHtml = studentAbsenceEmailTemplate(
          emailData.studentName,
          emailData.className,
          emailData.absenceDate,
          emailData.sessionTime,
          emailData.subject,
          emailData.teacherName,
          emailData.note
        );

        const emailSubject = `⚠️ Thông báo vắng học - ${emailData.studentName} - ${emailData.className}`;

        await emailUtil(emailData.to, emailSubject, emailHtml);

        results.success.push({
          studentId: emailData.studentId,
          studentName: emailData.studentName,
          email: emailData.to,
        });

        console.log(`✅ Đã gửi email cho ${emailData.studentName}`);
      } catch (error: any) {
        results.failed.push({
          studentId: emailData.studentId,
          studentName: emailData.studentName,
          email: emailData.to,
          error: error.message,
        });

        console.error(`❌ Lỗi khi gửi email cho ${emailData.studentName}: ${error.message}`);
      }

      // Delay nhỏ giữa các email để tránh spam
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const duration = Date.now() - startTime;
    console.log(
      `📊 [Batch Job ${job.id}] Hoàn thành trong ${duration}ms\n` +
      `   - Thành công: ${results.success.length}/${results.total}\n` +
      `   - Thất bại: ${results.failed.length}/${results.total}`
    );

    return results;
  }
}
