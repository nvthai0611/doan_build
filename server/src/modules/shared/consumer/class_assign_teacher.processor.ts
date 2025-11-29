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

interface ClassStatusChangeTeacherEmailData {
  to: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subjectName?: string;
  roomName?: string;
  oldStatus: string;
  newStatus: string;
  oldStatusLabel: string;
  newStatusLabel: string;
  emailSubject: string;
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

  /**
   * Xử lý gửi email thông báo thay đổi trạng thái lớp học cho giáo viên
   */
  @Process('send_class_status_change_teacher_email')
  async handleSendClassStatusChangeTeacherEmail(job: Job<ClassStatusChangeTeacherEmailData>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu gửi email thay đổi status lớp học cho giáo viên\n` +
      `   - Giáo viên: ${job.data.teacherName}\n` +
      `   - Lớp học: ${job.data.className}\n` +
      `   - Status: "${job.data.oldStatusLabel}" → "${job.data.newStatusLabel}"\n` +
      `   - ClassId: ${job.data.classId}`
    );
    
    const {
      to,
      teacherId,
      classId,
      className,
      teacherName,
      subjectName,
      roomName,
      oldStatusLabel,
      newStatusLabel,
      emailSubject,
    } = job.data;

    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error('Email giáo viên không hợp lệ');
      }

      // Tạo email template
      const statusIcons: Record<string, string> = {
        'ready': '📋',
        'active': '✅',
        'completed': '🎓',
        'suspended': '⏸️',
        'cancelled': '❌',
      };
      const statusColors: Record<string, string> = {
        'ready': '#F59E0B',
        'active': '#10B981',
        'completed': '#3B82F6',
        'suspended': '#F59E0B',
        'cancelled': '#EF4444',
      };

      const icon = statusIcons[job.data.newStatus] || '📌';
      const color = statusColors[job.data.newStatus] || '#757575';

      const emailHtml = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thông báo thay đổi trạng thái lớp học</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h2 style="color: ${color};">Thông báo thay đổi trạng thái lớp học</h2>
            
            <p>Xin chào <strong>${teacherName}</strong>,</p>
            
            <p>Trạng thái lớp học của bạn đã được thay đổi:</p>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${color};">
              <p><strong>Tên lớp:</strong> ${className}</p>
              ${subjectName ? `<p><strong>Môn học:</strong> ${subjectName}</p>` : ''}
              ${roomName ? `<p><strong>Phòng học:</strong> ${roomName}</p>` : ''}
              <p style="margin-top: 15px;">
                <span style="color: #666;">Trạng thái cũ:</span> <strong>${oldStatusLabel}</strong>
              </p>
              <p>
                <span style="color: #666;">Trạng thái mới:</span> 
                <strong style="color: ${color}; font-size: 16px;">${icon} ${newStatusLabel}</strong>
              </p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>📌 Lưu ý:</strong></p>
              <ul>
                <li>Vui lòng kiểm tra thông tin lớp học trên hệ thống</li>
                <li>Liên hệ phụ trách nếu có thắc mắc</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/teachers/schedule" 
                 style="display: inline-block; background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">
                Xem lịch dạy
              </a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Trân trọng,<br>
              Hệ thống quản lý giáo dục
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Educational Center. Email này được gửi tự động.
            </p>
          </div>
        </body>
        </html>
      `;

      // Gửi email
      await emailUtil(to, emailSubject, emailHtml);
      
      const duration = Date.now() - startTime;
      console.log(
        `✅ [Job ${job.id}] Email thay đổi status đã gửi thành công trong ${duration}ms\n` +
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

