import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import emailUtil from '../../../utils/email.util';
import { PrismaService } from '../../../db/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailNotificationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email_notification') private readonly emailNotificationQueue: Queue,
    @InjectQueue('teacher_account') private readonly teacherAccountQueue: Queue,
    @InjectQueue('class_assign_teacher') private readonly classAssignTeacherQueue: Queue
  ) {}


  /**
   * Lấy label cho trạng thái lớp học
   */
  private getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'draft': 'Bản nháp',
      'ready': 'Sẵn sàng',
      'active': 'Đang hoạt động',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy',
      'suspended': 'Tạm dừng'
    };
    return statusLabels[status] || status;
  }


  /**
   * Gửi email thông báo vắng mặt cho nhiều học sinh
   * @param studentIds Mảng ID của các học sinh vắng mặt
   * @param sessionId ID của buổi học
   * @param teacherId ID của giáo viên ghi nhận điểm danh
   */
  async sendStudentAbsenceEmail(
    studentIds: string[],
    sessionId: string,
    teacherId: string
  ) {
    try {
      // Validate input
      if (!studentIds || studentIds.length === 0) {
        throw new HttpException(
          'Danh sách học sinh không được để trống',
          HttpStatus.BAD_REQUEST
        );
      }

      console.log(`🚀 Bắt đầu xử lý gửi email cho ${studentIds.length} học sinh`);

      // Kiểm tra học sinh đã được gửi email
      const attendanceRecords = await this.prisma.studentSessionAttendance.findMany({
        where: {
          sessionId,
          studentId: { in: studentIds },
          status: 'absent'
        },
        select: {
          studentId: true,
          isSent: true,
          sentAt: true
        }
      });

      // Lọc học sinh đã gửi email
      const alreadySentStudentIds = attendanceRecords
        .filter(record => record.isSent === true)
        .map(record => record.studentId);

      // Lọc học sinh chưa gửi email
      const studentsToSendEmail = studentIds.filter(
        id => !alreadySentStudentIds.includes(id)
      );

      // Nếu tất cả đã gửi email
      if (studentsToSendEmail.length === 0) {
        console.log(`⚠️ Tất cả ${studentIds.length} học sinh đã được gửi email`);
        
        return {
          success: true,
          sentCount: 0,
          failCount: 0,
          alreadySentCount: alreadySentStudentIds.length,
          totalStudents: studentIds.length,
          message: 'Tất cả học sinh đã được gửi email thông báo vắng mặt trước đó',
          details: []
        };
      }

      console.log(
        `📊 Thống kê:\n` +
        `   - Tổng: ${studentIds.length} học sinh\n` +
        `   - Cần gửi: ${studentsToSendEmail.length}\n` +
        `   - Đã gửi trước đó: ${alreadySentStudentIds.length}`
      );

      // Lấy thông tin buổi học
      const session = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: {
          class: {
            include: {
              subject: true
            }
          }
        }
      });

      if (!session) {
        throw new HttpException(
          'Không tìm thấy buổi học',
          HttpStatus.NOT_FOUND
        );
      }

      // Lấy thông tin giáo viên
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          user: true
        }
      });

      if (!teacher) {
        throw new HttpException(
          'Không tìm thấy giáo viên',
          HttpStatus.NOT_FOUND
        );
      }

      // Lấy thông tin học sinh chưa gửi email
      const students = await this.prisma.student.findMany({
        where: {
          id: { in: studentsToSendEmail }
        },
        include: {
          user: true,
          parent: {
            include: {
              user: true
            }
          }
        }
      });

      if (students.length === 0) {
        throw new HttpException(
          'Không tìm thấy học sinh nào cần gửi email',
          HttpStatus.NOT_FOUND
        );
      }

      // Chuẩn bị dữ liệu chung
      const absenceDate = new Date(session.sessionDate).toLocaleDateString('vi-VN');
      const sessionTime = `${session.startTime} - ${session.endTime}`;
      const subjectName = session.class?.subject?.name || 'N/A';
      const className = session.class?.name || 'N/A';
      const teacherName = teacher.user?.fullName || 'N/A';

      // Thêm từng email vào queue
      const emailResults = [];
      const jobPromises = [];

      for (const student of students) {
        const parentEmail = student.parent?.user?.email;
        
        if (!parentEmail) {
          console.warn(
            `⚠️ Không tìm thấy email phụ huynh cho học sinh ${student.user?.fullName}`
          );
          
          emailResults.push({
            studentId: student.id,
            studentName: student.user?.fullName,
            success: false,
            reason: 'Không có email phụ huynh'
          });
          continue;
        }

        try {
          // Thêm job vào queue với priority và delay
          const jobPromise = this.emailNotificationQueue.add(
            'send_student_absence_email',
            {
              to: parentEmail,
              studentName: student.user?.fullName || 'N/A',
              className,
              absenceDate,
              sessionTime,
              subject: subjectName,
              teacherName,
              note: '',
              sessionId,
              studentId: student.id
            },
            {
              priority: 1, // Priority cao hơn cho email khẩn cấp
              delay: 2000, // Delay 2s giữa các email
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000
              },
              removeOnComplete: 10,
              removeOnFail: 5
            }
          );

          jobPromises.push(jobPromise);

          // Cập nhật trạng thái isSent ngay lập tức
          await this.prisma.studentSessionAttendance.updateMany({
            where: {
              sessionId,
              studentId: student.id,
              status: 'absent',
              isSent: false
            },
            data: {
              isSent: true,
              sentAt: new Date()
            }
          });

          console.log(`📨 Đã thêm job gửi email cho ${student.user?.fullName} vào queue`);

          emailResults.push({
            studentId: student.id,
            studentName: student.user?.fullName,
            parentEmail,
            success: true
          });
        } catch (error: any) {
          console.error(
            `❌ Lỗi khi thêm job cho ${student.user?.fullName}: ${error.message}`
          );
          
          emailResults.push({
            studentId: student.id,
            studentName: student.user?.fullName,
            success: false,
            reason: error.message
          });
        }
      }

      // Đợi tất cả jobs được thêm vào queue
      await Promise.all(jobPromises);

      const successCount = emailResults.filter(r => r.success).length;
      const failCount = emailResults.filter(r => !r.success).length;

      console.log(
        `✅ Đã thêm ${successCount}/${studentsToSendEmail.length} email vào queue thành công\n` +
        `   - Thành công: ${successCount}\n` +
        `   - Thất bại: ${failCount}\n` +
        `   - Đã gửi trước: ${alreadySentStudentIds.length}`
      );

      return {
        success: true,
        sentCount: successCount,
        failCount,
        alreadySentCount: alreadySentStudentIds.length,
        totalStudents: studentIds.length,
        details: emailResults,
        message: `Đã thêm ${successCount} email vào hàng đợi. Email sẽ được gửi trong giây lát.`
      };
    } catch (error: any) {
      console.error('❌ Lỗi khi xử lý gửi email:', error);
      throw new HttpException(
        error.message || 'Lỗi khi gửi email thông báo vắng học',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Kiểm tra trạng thái queue
   */
  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailNotificationQueue.getWaitingCount(),
      this.emailNotificationQueue.getActiveCount(),
      this.emailNotificationQueue.getCompletedCount(),
      this.emailNotificationQueue.getFailedCount(),
      this.emailNotificationQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  }

  /**
   * Gửi email thông báo tài khoản cho giáo viên mới qua queue
   */
  async sendTeacherAccountEmail(
    teacherId: string,
    teacherName: string,
    username: string,
    email: string,
    password: string,
    teacherCode: string
  ) {
    try {
      console.log(`📧 Thêm job gửi email tài khoản cho giáo viên: ${teacherName}`);

      await this.teacherAccountQueue.add('send_teacher_account_email', {
        to: email,
        teacherName,
        username,
        email,
        password,
        teacherCode,
        teacherId,
      });

      console.log(`✅ Đã thêm job gửi email tài khoản vào queue cho: ${email}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        teacherId,
        email,
      };
    } catch (error: any) {
      console.error(`❌ Lỗi khi thêm job email tài khoản: ${error.message}`);
      throw new HttpException(
        `Không thể gửi email tài khoản: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Gửi email thông báo phân công lớp học cho giáo viên qua queue
   */
  async sendClassAssignTeacherEmail(
    classId: string,
    teacherId: string
  ) {
    try {
      // Lấy thông tin lớp học và giáo viên
      const classData = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          subject: true,
        },
      });

      if (!classData) {
        throw new HttpException('Không tìm thấy lớp học', HttpStatus.NOT_FOUND);
      }

      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      if (!teacher) {
        throw new HttpException('Không tìm thấy giáo viên', HttpStatus.NOT_FOUND);
      }

      console.log(`📧 Thêm job gửi email phân công lớp cho giáo viên: ${teacher.user.fullName}`);

      await this.classAssignTeacherQueue.add('send_class_assign_teacher_email', {
        to: teacher.user.email,
        teacherId: teacher.id,
        teacherName: teacher.user.fullName,
        classId: classData.id,
        className: classData.name,
        subject: classData.subject?.name,
        startDate: classData.actualStartDate ? new Date(classData.actualStartDate).toLocaleDateString('vi-VN') : undefined,
        schedule: classData.recurringSchedule,
      });

      console.log(`✅ Đã thêm job gửi email phân công lớp vào queue cho: ${teacher.user.email}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        teacherId,
        classId,
        email: teacher.user.email,
      };
    } catch (error: any) {
      console.error(`❌ Lỗi khi thêm job email phân công lớp: ${error.message}`);
      throw new HttpException(
        `Không thể gửi email phân công lớp: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Gửi email thông báo hủy phân công lớp học cho giáo viên qua queue
   */
  async sendClassRemoveTeacherEmail(
    classId: string,
    teacherId: string,
    reason?: string
  ) {
    try {
      // Lấy thông tin lớp học và giáo viên
      const classData = await this.prisma.class.findUnique({
        where: { id: classId },
        select: {
          id: true,
          name: true,
        },
      });

      if (!classData) {
        throw new HttpException('Không tìm thấy lớp học', HttpStatus.NOT_FOUND);
      }

      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      if (!teacher) {
        throw new HttpException('Không tìm thấy giáo viên', HttpStatus.NOT_FOUND);
      }

      console.log(`📧 Thêm job gửi email hủy phân công lớp cho giáo viên: ${teacher.user.fullName}`);

      await this.classAssignTeacherQueue.add('send_class_remove_teacher_email', {
        to: teacher.user.email,
        teacherId: teacher.id,
        teacherName: teacher.user.fullName,
        classId: classData.id,
        className: classData.name,
        reason,
      });

      console.log(`✅ Đã thêm job gửi email hủy phân công lớp vào queue cho: ${teacher.user.email}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        teacherId,
        classId,
        email: teacher.user.email,
      };
    } catch (error: any) {
      console.error(`❌ Lỗi khi thêm job email hủy phân công lớp: ${error.message}`);
      throw new HttpException(
        `Không thể gửi email hủy phân công lớp: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
