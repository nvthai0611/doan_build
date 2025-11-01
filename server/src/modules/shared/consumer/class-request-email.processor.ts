import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import emailUtil from '../../../utils/email.util';
import { classRequestApprovalEmailTemplate } from '../template-email/template-class-request-approval';
import { classRequestRejectionEmailTemplate } from '../template-email/template-class-request-rejection';

interface ClassRequestApprovalEmailData {
  to: string;
  studentName: string;
  parentName: string;
  className: string;
  subjectName: string;
  teacherName?: string;
  startDate?: string;
  schedule?: any;
  username?: string;
  password?: string;
  requestId: string;
  studentId: string;
  classId: string;
}

interface ClassRequestRejectionEmailData {
  to: string;
  studentName: string;
  parentName: string;
  className: string;
  subjectName: string;
  reason?: string;
  requestId: string;
  studentId: string;
  classId: string;
}

@Processor('class_request_email')
export class ClassRequestEmailProcessor {
  /**
   * Xử lý gửi email thông báo chấp nhận yêu cầu tham gia lớp học
   */
  @Process('send_approval_notification')
  async handleSendApprovalEmail(job: Job<ClassRequestApprovalEmailData>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu xử lý email chấp nhận yêu cầu\n` +
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
      username,
      password,
      requestId,
      studentId,
      classId,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email phụ huynh không hợp lệ');
      }

      // Tạo email template
      const emailHtml = classRequestApprovalEmailTemplate({
        studentName,
        parentName,
        className,
        subjectName,
        teacherName,
        startDate,
        schedule,
        username,
        password,
      });

      // Subject cho email
      const emailSubject = `✅ Yêu cầu tham gia lớp học đã được chấp nhận - ${studentName}`;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `✅ [Job ${job.id}] Email chấp nhận đã gửi thành công trong ${duration}ms\n` +
        `   - Học sinh: ${studentName}\n` +
        `   - Email phụ huynh: ${to}\n` +
        `   - RequestId: ${requestId}\n` +
        `   - StudentId: ${studentId}\n` +
        `   - ClassId: ${classId}`
      );

      return {
        success: true,
        message: 'Approval email sent successfully',
        studentId,
        classId,
        requestId,
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
      throw new Error(`Failed to send approval email to ${to}: ${error.message}`);
    }
  }

  /**
   * Xử lý gửi email thông báo từ chối yêu cầu tham gia lớp học
   */
  @Process('send_rejection_notification')
  async handleSendRejectionEmail(job: Job<ClassRequestRejectionEmailData>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu xử lý email từ chối yêu cầu\n` +
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
      reason,
      requestId,
      studentId,
      classId,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email phụ huynh không hợp lệ');
      }

      // Tạo email template
      const emailHtml = classRequestRejectionEmailTemplate({
        studentName,
        parentName,
        className,
        subjectName,
        reason,
      });

      // Subject cho email
      const emailSubject = `❌ Yêu cầu tham gia lớp học đã bị từ chối - ${studentName}`;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `[Job ${job.id}] Email từ chối đã gửi thành công trong ${duration}ms\n` +
        `   - Học sinh: ${studentName}\n` +
        `   - Email phụ huynh: ${to}\n` +
        `   - RequestId: ${requestId}\n` +
        `   - StudentId: ${studentId}\n` +
        `   - ClassId: ${classId}`
      );

      return {
        success: true,
        message: 'Rejection email sent successfully',
        studentId,
        classId,
        requestId,
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
      throw new Error(`Failed to send rejection email to ${to}: ${error.message}`);
    }
  }
}

