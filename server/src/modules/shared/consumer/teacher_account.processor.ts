import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import emailUtil from '../../../utils/email.util';
import { teacherAccountEmailTemplate } from '../template-email/teacher-account-template';

interface TeacherAccountEmailData {
  to: string;
  teacherName: string;
  username: string;
  email: string;
  password: string;
  teacherCode: string;
  teacherId: string;
}

@Processor('teacher_account')
export class TeacherAccountProcessor {
  /**
   * Xử lý gửi email thông báo tài khoản cho giáo viên mới
   */
  @Process('send_teacher_account_email')
  async handleSendTeacherAccountEmail(job: Job<TeacherAccountEmailData>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu gửi email tài khoản giáo viên\n` +
      `   - Giáo viên: ${job.data.teacherName}\n` +
      `   - Email: ${job.data.to}`
    );
    
    const {
      to,
      teacherName,
      username,
      email,
      password,
      teacherCode,
      teacherId,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email giáo viên không hợp lệ');
      }

      // Tạo email template
      const emailHtml = teacherAccountEmailTemplate(
        teacherName,
        username,
        email,
        password,
        teacherCode
      );

      // Subject cho email
      const emailSubject = `🎓 Chào mừng đến với Trung tâm - Thông tin tài khoản của bạn`;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `✅ [Job ${job.id}] Email tài khoản đã gửi thành công trong ${duration}ms\n` +
        `   - Giáo viên: ${teacherName}\n` +
        `   - Email: ${to}\n` +
        `   - TeacherId: ${teacherId}`
      );

      return {
        success: true,
        message: 'Email sent successfully',
        teacherId,
        sentTo: to,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(
        `❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
        `   - Giáo viên: ${teacherName}\n` +
        `   - Email: ${to}\n` +
        `   - Lỗi: ${error.message}\n` +
        `   - Attempts: ${job.attemptsMade}/${job.opts.attempts}`
      );

      // Throw error để Bull retry job theo config
      throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}

