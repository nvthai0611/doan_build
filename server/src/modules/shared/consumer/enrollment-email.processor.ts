import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import emailUtil from '../../../utils/email.util';
import { enrollmentNotificationEmailTemplate } from '../template-email/template-enrollment';

interface EnrollmentEmailData {
  to: string;
  studentName: string;
  parentName: string;
  className: string;
  subjectName: string;
  teacherName?: string;
  startDate?: string;
  schedule?: any;
  enrollmentStatus: string;
  studentId: string;
  classId: string;
  isTransfer?: boolean;
  oldClassName?: string;
  transferReason?: string;
}

@Processor('enrollment_email')
export class EnrollmentEmailProcessor {
  /**
   * Xử lý gửi email thông báo đăng ký lớp cho phụ huynh
   */
  @Process('send_enrollment_notification')
  async handleSendEnrollmentEmail(job: Job<EnrollmentEmailData>) {
    const startTime = Date.now();
    console.log(
      `[Job ${job.id}] Bắt đầu xử lý email ${job.data.isTransfer ? 'chuyển lớp' : 'đăng ký lớp'}\n` +
      `   - Học sinh: ${job.data.studentName}\n` +
      `   - Lớp: ${job.data.className}\n` +
      `   - Email: ${job.data.to}`
    );
    
    const {
      to,
      studentName,
      parentName,
      className,
      subjectName,
      teacherName,
      startDate,
      schedule,
      enrollmentStatus,
      studentId,
      classId,
      isTransfer,
      oldClassName,
      transferReason,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email phụ huynh không hợp lệ');
      }

      // Tạo email template
      const emailHtml = enrollmentNotificationEmailTemplate({
        studentName,
        parentName,
        className,
        subjectName,
        teacherName,
        startDate,
        schedule,
        enrollmentStatus,
        isTransfer,
        oldClassName,
        transferReason,
      });

      // Subject cho email
      const emailSubject = isTransfer 
        ? `Thông báo chuyển lớp - ${studentName} - ${className}`
        : `Thông báo đăng ký lớp - ${studentName} - ${className}`;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `[Job ${job.id}] Email ${isTransfer ? 'chuyển lớp' : 'đăng ký lớp'} đã gửi thành công trong ${duration}ms\n` +
        `   - Học sinh: ${studentName}\n` +
        `   - Email phụ huynh: ${to}\n` +
        `   - ClassId: ${classId}\n` +
        `   - StudentId: ${studentId}`
      );

      return {
        success: true,
        message: 'Enrollment email sent successfully',
        studentId,
        classId,
        sentTo: to,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(
        `[Job ${job.id}] Lỗi sau ${duration}ms\n` +
        `   - Học sinh: ${studentName}\n` +
        `   - Email: ${to}\n` +
        `   - Lỗi: ${error.message}\n` +
        `   - Attempts: ${job.attemptsMade}/${job.opts.attempts}`
      );

      // Throw error để Bull retry job theo config
      throw new Error(`Failed to send enrollment email to ${to}: ${error.message}`);
    }
  }
}

