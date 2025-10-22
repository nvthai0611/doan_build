import { Process, Processor } from '@nestjs/bull';
import emailUtil from '../../../utils/email.util';
import { studentAbsenceEmailTemplate } from '../template-email/template-notification';

// Định nghĩa 1 processor lắng nghe queue tên 'email'
@Processor('email_notification')
export class EmailNotificationProcessor {
  // Định nghĩa hàm xử lý cho job tên 'send_student_absence_email'
  @Process('send_student_absence_email')
  async handleSendStudentAbsenceEmail(job: any) {
    console.log(`[${job.id}] Bắt đầu xử lý job...`);
    const {
      to,
      studentName,
      className,
      absenceDate,
      sessionTime,
      subject,
      teacherName,
      note,
    } = job.data;
    const templateEmail = studentAbsenceEmailTemplate(
      studentName,
      className,
      absenceDate,
      sessionTime,
      subject,
      teacherName,
      note
    )
    try {
      // Gửi email thống báo vắng mặt cho lớp học
      await emailUtil(to, subject, templateEmail);
      console.log(
        `[${job.id}] Đã gửi email thống báo vắng mặt cho lớp ${className} tới ${to} (tên con: ${studentName})`,
      );
    } catch (error) {
      console.error(`[${job.id}] Xảy ra lỗi khi gửi email: ${error.message}`);
    }
  }
}
