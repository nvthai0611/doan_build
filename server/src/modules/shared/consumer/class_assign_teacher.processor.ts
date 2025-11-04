import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import emailUtil from '../../../utils/email.util';
import { classAssignTeacherEmailTemplate } from '../template-email/template-class-assign-teacher.template';
import { classRemoveTeacherEmailTemplate } from '../template-email/template-class-remove-teacher.template';

interface ClassAssignTeacherEmailData {
  to: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subject?: string;
  startDate?: string;
  schedule?: any;
}

interface ClassRemoveTeacherEmailData {
  to: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  reason?: string;
}

@Processor('class_assign_teacher')
export class ClassAssignTeacherProcessor {
  /**
   * Xử lý gửi email thông báo phân công lớp học cho giáo viên
   */
  @Process('send_class_assign_teacher_email')
  async handleSendClassAssignTeacherEmail(job: Job<ClassAssignTeacherEmailData>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu gửi email phân công lớp học cho giáo viên\n` +
      `   - Giáo viên: ${job.data.teacherName}\n` +
      `   - Lớp học: ${job.data.className}\n` +
      `   - ClassId: ${job.data.classId}`
    );
    
    const {
      to,
      teacherId,
      classId,
      className,
      teacherName,
      subject,
      startDate,
      schedule,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email giáo viên không hợp lệ');
      }

      // Tạo email template
      const emailHtml = classAssignTeacherEmailTemplate(
        teacherName,
        className,
        subject,
        startDate,
        schedule
      );

      // Subject cho email
      const emailSubject = `📚 Thông báo phân công lớp học - ${className}`;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `✅ [Job ${job.id}] Email phân công lớp đã gửi thành công trong ${duration}ms\n` +
        `   - Giáo viên: ${teacherName}\n` +
        `   - Email: ${to}\n` +
        `   - TeacherId: ${teacherId}\n` +
        `   - ClassId: ${classId}`
      );

      return {
        success: true,
        message: 'Email sent successfully',
        teacherId,
        classId,
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

  /**
   * Xử lý gửi email thông báo hủy phân công lớp học cho giáo viên
   */
  @Process('send_class_remove_teacher_email')
  async handleSendClassRemoveTeacherEmail(job: Job<ClassRemoveTeacherEmailData>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu gửi email hủy phân công lớp học cho giáo viên\n` +
      `   - Giáo viên: ${job.data.teacherName}\n` +
      `   - Lớp học: ${job.data.className}\n` +
      `   - ClassId: ${job.data.classId}`
    );
    
    const {
      to,
      teacherId,
      classId,
      className,
      teacherName,
      reason,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email giáo viên không hợp lệ');
      }

      // Tạo email template
      const emailHtml = classRemoveTeacherEmailTemplate(
        teacherName,
        className,
        reason
      );

      // Subject cho email
      const emailSubject = `🚫 Thông báo hủy phân công lớp học - ${className}`;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `✅ [Job ${job.id}] Email hủy phân công lớp đã gửi thành công trong ${duration}ms\n` +
        `   - Giáo viên: ${teacherName}\n` +
        `   - Email: ${to}\n` +
        `   - TeacherId: ${teacherId}\n` +
        `   - ClassId: ${classId}`
      );

      return {
        success: true,
        message: 'Email sent successfully',
        teacherId,
        classId,
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

