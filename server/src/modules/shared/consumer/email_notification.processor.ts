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

  /**
   * Xử lý gửi email thông báo lớp sắp bắt đầu
   */
  @Process('send_class_starting_notification')
  async handleSendClassStartingNotification(job: Job<any>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu xử lý email thông báo lớp sắp bắt đầu\n` +
      `   - Lớp: ${job.data.className}\n` +
      `   - Email: ${job.data.to}`
    );

    const {
      to,
      className,
      classCode,
      subjectName,
      gradeName,
      daysRemaining,
      startDate,
      teacherName,
      roomName,
      scheduleText,
      currentStudents,
      maxStudents,
      hasTeacher,
      hasRoom,
      hasStudents,
    } = job.data;

    try {
      if (!to || !to.includes('@')) {
        throw new Error('Email không hợp lệ');
      }

      // Tạo email HTML
      const warnings = [];
      if (!hasTeacher) warnings.push('⚠️ Chưa phân công giáo viên');
      if (!hasRoom) warnings.push('⚠️ Chưa phân công phòng học');
      if (!hasStudents) warnings.push('⚠️ Chưa có học sinh đăng ký');

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .info-item { margin: 10px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📅 Thông báo lớp sắp bắt đầu</h2>
            </div>
            <div class="content">
              <p>Xin chào,</p>
              <p>Lớp học <strong>"${className}"</strong>${classCode ? ` (${classCode})` : ''} sẽ bắt đầu sau <strong>${daysRemaining} ngày</strong> (${startDate}).</p>
              
              <h3>📋 Thông tin lớp học:</h3>
              <div class="info-item"><strong>Môn học:</strong> ${subjectName}</div>
              <div class="info-item"><strong>Khối:</strong> ${gradeName}</div>
              <div class="info-item"><strong>Giáo viên:</strong> ${teacherName}</div>
              <div class="info-item"><strong>Phòng học:</strong> ${roomName}</div>
              <div class="info-item"><strong>Lịch học:</strong> ${scheduleText || 'Chưa cập nhật'}</div>
              <div class="info-item"><strong>Học sinh:</strong> ${currentStudents}/${maxStudents}</div>

              ${warnings.length > 0 ? `
                <div class="warning">
                  <h4>🔔 Cần chuẩn bị:</h4>
                  <ul>
                    ${warnings.map(w => `<li>${w}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              <p>Vui lòng kiểm tra và chuẩn bị các thông tin cần thiết trước khi lớp học bắt đầu.</p>
            </div>
            <div class="footer">
              <p>Đây là email tự động từ hệ thống quản lý trung tâm giáo dục.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailSubject = `📅 Lớp "${className}" sẽ bắt đầu sau ${daysRemaining} ngày`;

      await emailUtil(to, emailSubject, emailHtml);

      const duration = Date.now() - startTime;
      console.log(
        `✅ [Job ${job.id}] Email đã gửi thành công trong ${duration}ms\n` +
        `   - Lớp: ${className}\n` +
        `   - Email: ${to}`
      );

      return {
        success: true,
        message: 'Email sent successfully',
        className,
        sentTo: to,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(
        `❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
        `   - Lớp: ${className}\n` +
        `   - Email: ${to}\n` +
        `   - Lỗi: ${error.message}`
      );

      throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  /**
   * Xử lý gửi email thông báo lớp sắp kết thúc
   */
  @Process('send_class_ending_notification')
  async handleSendClassEndingNotification(job: Job<any>) {
    const startTime = Date.now();
    console.log(
      `📧 [Job ${job.id}] Bắt đầu xử lý email thông báo lớp sắp kết thúc\n` +
      `   - Lớp: ${job.data.className}\n` +
      `   - Email: ${job.data.to}`
    );

    const {
      to,
      className,
      classCode,
      subjectName,
      gradeName,
      daysRemaining,
      endDate,
      teacherName,
      roomName,
      scheduleText,
      currentStudents,
      maxStudents,
    } = job.data;

    try {
      if (!to || !to.includes('@')) {
        throw new Error('Email không hợp lệ');
      }

      // Tạo email HTML
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .info-item { margin: 10px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📅 Thông báo lớp sắp kết thúc</h2>
            </div>
            <div class="content">
              <p>Xin chào,</p>
              <p>Lớp học <strong>"${className}"</strong>${classCode ? ` (${classCode})` : ''} sẽ kết thúc sau <strong>${daysRemaining} ngày</strong> (${endDate}).</p>
              
              <h3>📋 Thông tin lớp học:</h3>
              <div class="info-item"><strong>Môn học:</strong> ${subjectName}</div>
              <div class="info-item"><strong>Khối:</strong> ${gradeName}</div>
              <div class="info-item"><strong>Giáo viên:</strong> ${teacherName}</div>
              <div class="info-item"><strong>Phòng học:</strong> ${roomName}</div>
              <div class="info-item"><strong>Lịch học:</strong> ${scheduleText || 'Chưa cập nhật'}</div>
              <div class="info-item"><strong>Học sinh:</strong> ${currentStudents}/${maxStudents}</div>

              <div class="warning">
                <h4>🔔 Cần chuẩn bị:</h4>
                <ul>
                  <li>Chuẩn bị đánh giá cuối khóa</li>
                  <li>Chuẩn bị chứng chỉ/giấy chứng nhận (nếu có)</li>
                  <li>Thông báo cho phụ huynh về việc kết thúc lớp</li>
                </ul>
              </div>

              <p>Vui lòng chuẩn bị các công việc cần thiết trước khi lớp học kết thúc.</p>
            </div>
            <div class="footer">
              <p>Đây là email tự động từ hệ thống quản lý trung tâm giáo dục.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailSubject = `📅 Lớp "${className}" sẽ kết thúc sau ${daysRemaining} ngày`;

      await emailUtil(to, emailSubject, emailHtml);

      const duration = Date.now() - startTime;
      console.log(
        `✅ [Job ${job.id}] Email đã gửi thành công trong ${duration}ms\n` +
        `   - Lớp: ${className}\n` +
        `   - Email: ${to}`
      );

      return {
        success: true,
        message: 'Email sent successfully',
        className,
        sentTo: to,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(
        `❌ [Job ${job.id}] Lỗi sau ${duration}ms\n` +
        `   - Lớp: ${className}\n` +
        `   - Email: ${to}\n` +
        `   - Lỗi: ${error.message}`
      );

      throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}
