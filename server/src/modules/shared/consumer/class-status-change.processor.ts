import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import emailUtil from '../../../utils/email.util';
import { classStatusChangeEmailTemplate } from '../template-email/template-class-status-change';

interface ClassStatusChangeEmailData {
  to: string;
  parentName: string;
  studentName: string;
  className: string;
  subjectName: string;
  teacherName?: string;
  oldStatus: string;
  newStatus: string;
  statusLabel: string;
  statusColor: string;
  statusIcon: string;
  classId: string;
}

@Processor('class_status_change_email')
export class ClassStatusChangeProcessor {
  /**
   * Xử lý gửi email thông báo thay đổi trạng thái lớp học cho phụ huynh
   */
  @Process('send_class_status_change_notification')
  async handleSendClassStatusChangeEmail(job: Job<ClassStatusChangeEmailData>) {
    const startTime = Date.now();
    console.log(
      `[Job ${job.id}] Bắt đầu xử lý email thông báo thay đổi status lớp\n` +
      `   - Học sinh: ${job.data.studentName}\n` +
      `   - Lớp: ${job.data.className}\n` +
      `   - Status: ${job.data.oldStatus} -> ${job.data.newStatus}\n` +
      `   - Email: ${job.data.to}`
    );
    
    const {
      to,
      parentName,
      studentName,
      className,
      subjectName,
      teacherName,
      oldStatus,
      newStatus,
      statusLabel,
      statusIcon,
      classId,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email phụ huynh không hợp lệ');
      }

      // Tạo email template
      const emailHtml = classStatusChangeEmailTemplate({
        parentName,
        studentName,
        className,
        subjectName,
        teacherName,
        oldStatus,
        newStatus,
        statusLabel,
        statusColor: '', // Không cần cho template text đơn giản
        statusIcon,
      });

      // Subject cho email
      const emailSubject = `${statusIcon} Thông báo thay đổi trạng thái lớp học - ${className}`;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `[Job ${job.id}] Email thông báo status đã gửi thành công trong ${duration}ms\n` +
        `   - Học sinh: ${studentName}\n` +
        `   - Email phụ huynh: ${to}\n` +
        `   - ClassId: ${classId}`
      );

      return {
        success: true,
        message: 'Class status change email sent successfully',
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
      throw new Error(`Failed to send class status change email to ${to}: ${error.message}`);
    }
  }
}

