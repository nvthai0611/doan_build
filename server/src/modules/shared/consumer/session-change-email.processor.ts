import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import emailUtil from '../../../utils/email.util';
import { sessionChangeEmailTemplate, SessionChangeTemplateData } from '../template-email/template-session-change';

interface SessionChangeEmailJob extends SessionChangeTemplateData {
  to: string;
  sessionId: string;
  classId: string;
}

@Processor('session_change_email')
export class SessionChangeEmailProcessor {
  @Process('send_session_change_notification')
  async handleSessionChange(job: Job<SessionChangeEmailJob>) {
    const start = Date.now();
    const {
      to,
      type,
      parentName,
      studentNames,
      className,
      subjectName,
      teacherName,
      originalDate,
      originalTime,
      newDate,
      newTime,
      reason,
      sessionId,
      classId,
    } = job.data;

    try {
      if (!to || !to.includes('@')) {
        throw new Error('Email phụ huynh không hợp lệ');
      }

      const html = sessionChangeEmailTemplate({
        type,
        parentName,
        studentNames,
        className,
        subjectName,
        teacherName,
        originalDate,
        originalTime,
        newDate,
        newTime,
        reason,
      });

      const subject =
        type === 'cancelled'
          ? `Thông báo nghỉ buổi học - ${className}`
          : `Cập nhật lịch buổi học - ${className}`;

      await emailUtil(to, subject, html);

      const duration = Date.now() - start;
      console.log(
        `[SessionChangeEmail] Job ${job.id} thành công sau ${duration}ms - session ${sessionId}`
      );

      return {
        success: true,
        sessionId,
        classId,
        sentTo: to,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - start;
      console.error(
        `[SessionChangeEmail] Job ${job.id} thất bại sau ${duration}ms: ${error.message}`
      );
      throw new Error(`Failed to send session change email to ${to}: ${error.message}`);
    }
  }
}

