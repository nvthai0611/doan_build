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
    @InjectQueue('class_assign_teacher') private readonly classAssignTeacherQueue: Queue,
    @InjectQueue('enrollment_email') private readonly enrollmentEmailQueue: Queue,
    @InjectQueue('class_status_change_email') private readonly classStatusChangeEmailQueue: Queue,
    @InjectQueue('class_request_email') private readonly classRequestEmailQueue: Queue,
    @InjectQueue('session_change_email') private readonly sessionChangeEmailQueue: Queue
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
              timeout: 60000, // 60 giây timeout cho mỗi job
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
      console.log(`Thêm job gửi email tài khoản cho giáo viên: ${teacherName}`);

      await this.teacherAccountQueue.add('send_teacher_account_email', {
        to: email,
        teacherName,
        username,
        email,
        password,
        teacherCode,
        teacherId,
      });

      console.log(`Đã thêm job gửi email tài khoản vào queue cho: ${email}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        teacherId,
        email,
      };
    } catch (error: any) {
      console.error(`Lỗi khi thêm job email tài khoản: ${error.message}`);
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

      console.log(`Đã thêm job gửi email phân công lớp vào queue cho: ${teacher.user.email}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        teacherId,
        classId,
        email: teacher.user.email,
      };
    } catch (error: any) {
      console.error(`Lỗi khi thêm job email phân công lớp: ${error.message}`);
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

      console.log(`Thêm job gửi email hủy phân công lớp cho giáo viên: ${teacher.user.fullName}`);

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
      console.error(`Lỗi khi thêm job email hủy phân công lớp: ${error.message}`);
      throw new HttpException(
        `Không thể gửi email hủy phân công lớp: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Gửi email thông báo thay đổi trạng thái lớp học cho giáo viên
   */
  async sendClassStatusChangeEmailToTeacher(
    classId: string,
    oldStatus: string,
    newStatus: string
  ) {
    try {
      // Chỉ gửi email cho các status quan trọng
      const importantStatuses = ['active', 'completed', 'suspended', 'cancelled', 'ready'];
      if (!importantStatuses.includes(newStatus)) {
        return { success: true, skipped: true, reason: 'Status không yêu cầu thông báo' };
      }

      console.log(`Bắt đầu gửi email thông báo thay đổi status lớp ${classId} từ "${oldStatus}" sang "${newStatus}" cho giáo viên`);

      // Lấy thông tin lớp học
      const classData = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          subject: true,
          room: true,
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!classData) {
        throw new HttpException('Không tìm thấy lớp học', HttpStatus.NOT_FOUND);
      }

      if (!classData.teacherId || !classData.teacher) {
        console.log(`Lớp học không có giáo viên phụ trách`);
        return { success: true, skipped: true, reason: 'Không có giáo viên phụ trách' };
      }

      if (!classData.teacher.user?.email) {
        console.warn(`Giáo viên ${classData.teacher.user?.fullName} không có email`);
        return { success: false, skipped: true, reason: 'Giáo viên không có email' };
      }

      const oldStatusLabel = this.getStatusLabel(oldStatus);
      const newStatusLabel = this.getStatusLabel(newStatus);

      // Xác định subject và icon dựa trên newStatus
      const statusConfig: Record<string, { subject: string; icon: string }> = {
        'ready': { subject: 'Thông báo lớp học sẵn sàng tuyển sinh', icon: '📋' },
        'active': { subject: 'Thông báo lớp học bắt đầu hoạt động', icon: '✅' },
        'completed': { subject: 'Thông báo lớp học đã hoàn thành', icon: '🎓' },
        'suspended': { subject: 'Thông báo lớp học tạm dừng', icon: '⏸️' },
        'cancelled': { subject: 'Thông báo lớp học đã bị hủy', icon: '❌' },
      };

      const config = statusConfig[newStatus] || { subject: 'Thông báo thay đổi trạng thái lớp học', icon: '📌' };
      const emailSubject = `${config.icon} ${config.subject} - ${classData.name}`;

      // Thêm job vào queue
      await this.classAssignTeacherQueue.add('send_class_status_change_teacher_email', {
        to: classData.teacher.user.email,
        teacherId: classData.teacher.id,
        teacherName: classData.teacher.user.fullName,
        classId: classData.id,
        className: classData.name,
        subjectName: classData.subject?.name,
        roomName: classData.room?.name,
        oldStatus,
        newStatus,
        oldStatusLabel,
        newStatusLabel,
        emailSubject,
      });

      console.log(`Đã thêm job gửi email thay đổi status cho giáo viên ${classData.teacher.user.fullName} vào queue`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        teacherId: classData.teacher.id,
        classId,
        email: classData.teacher.user.email,
      };
    } catch (error: any) {
      console.error(`Lỗi khi thêm job email thay đổi status cho giáo viên: ${error.message}`);
      throw new HttpException(
        `Không thể gửi email thay đổi status cho giáo viên: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Gửi email thông báo đăng ký lớp hoặc chuyển lớp hàng loạt cho phụ huynh
   * @param studentIds Mảng ID của các học sinh được đăng ký/chuyển lớp
   * @param classId ID của lớp học (lớp mới nếu là chuyển lớp)
   * @param transferInfo Thông tin chuyển lớp (nếu có): { oldClassId: string, reason?: string }
   */
  async sendBulkEnrollmentEmail(
    studentIds: string[], 
    classId: string,
    transferInfo?: { oldClassId: string; reason?: string }
  ) {
    try {

      // Lấy thông tin lớp học
      const classData = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          subject: true,
          teacher: {
            include: {
              user: true
            }
          },
          _count: {
            select: { sessions: true }
          }
        }
      });

      if (!classData) {
        throw new HttpException('Không tìm thấy lớp học', HttpStatus.NOT_FOUND);
      }

      // Xác định trạng thái enrollment
      const hasSession = classData._count.sessions > 0;
      const enrollmentStatus = hasSession ? 'studying' : 'not_been_updated';

      // Lấy thông tin học sinh và phụ huynh
      const students = await this.prisma.student.findMany({
        where: {
          id: { in: studentIds }
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
        throw new HttpException('Không tìm thấy học sinh nào', HttpStatus.NOT_FOUND);
      }

      // Lấy thông tin lớp cũ nếu là chuyển lớp
      let oldClassName: string | undefined;
      if (transferInfo) {
        const oldClass = await this.prisma.class.findUnique({
          where: { id: transferInfo.oldClassId },
          select: { name: true }
        });
        oldClassName = oldClass?.name || 'N/A';
      }

      // Chuẩn bị dữ liệu chung
      const className = classData.name || 'N/A';
      const subjectName = classData.subject?.name || 'N/A';
      const teacherName = classData.teacher?.user?.fullName || undefined;
      const startDate = classData.actualStartDate 
        ? new Date(classData.actualStartDate).toLocaleDateString('vi-VN')
        : undefined;
      const schedule = classData.recurringSchedule || undefined;

      // Thêm từng email vào queue
      const emailResults = [];
      const jobPromises = [];

      for (const student of students) {
        const parentEmail = student.parent?.user?.email;
        const parentName = student.parent?.user?.fullName || 'Quý phụ huynh';
        
        if (!parentEmail) {
          console.warn(
            `Không tìm thấy email phụ huynh cho học sinh ${student.user?.fullName}`
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
          // Thêm job vào queue
          const jobPromise = this.enrollmentEmailQueue.add(
            'send_enrollment_notification',
            {
              to: parentEmail,
              studentName: student.user?.fullName || 'N/A',
              parentName,
              className,
              subjectName,
              teacherName,
              startDate,
              schedule,
              enrollmentStatus,
              studentId: student.id,
              classId,
              // Thông tin chuyển lớp (nếu có)
              isTransfer: !!transferInfo,
              oldClassName: transferInfo ? oldClassName : undefined,
              transferReason: transferInfo?.reason
            },
            {
              priority: 2,
              delay: 1000, // Delay 1s giữa các email
              attempts: 3,
              timeout: 60000, // 60 giây timeout cho mỗi job
              backoff: {
                type: 'exponential',
                delay: 2000
              },
              removeOnComplete: 10,
              removeOnFail: 5
            }
          );

          jobPromises.push(jobPromise);

          console.log(`Đã thêm job gửi email ${transferInfo ? 'chuyển lớp' : 'đăng ký'} cho ${student.user?.fullName} vào queue`);

          emailResults.push({
            studentId: student.id,
            studentName: student.user?.fullName,
            parentEmail,
            success: true
          });
        } catch (error: any) {
          console.error(
            `Lỗi khi thêm job cho ${student.user?.fullName}: ${error.message}`
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
        `Đã thêm ${successCount}/${studentIds.length} email vào queue thành công\n` +
        `   - Thành công: ${successCount}\n` +
        `   - Thất bại: ${failCount}`
      );

      return {
        success: true,
        sentCount: successCount,
        failCount,
        totalStudents: studentIds.length,
        details: emailResults,
        message: `Đã thêm ${successCount} email thông báo ${transferInfo ? 'chuyển lớp' : 'đăng ký'} vào hàng đợi.`
      };
    } catch (error: any) {
      console.error('Lỗi khi xử lý gửi email đăng ký:', error);
      throw new HttpException(
        error.message || 'Lỗi khi gửi email thông báo đăng ký',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Gửi email thông báo thay đổi trạng thái lớp học cho phụ huynh
   * @param classId ID của lớp học
   * @param oldStatus Trạng thái cũ
   * @param newStatus Trạng thái mới
   */
  async sendClassStatusChangeEmailToParents(
    classId: string,
    oldStatus: string,
    newStatus: string
  ) {
    try {
      // Chỉ gửi email cho các status quan trọng
      const importantStatuses = ['active', 'completed', 'suspended', 'cancelled'];
      if (!importantStatuses.includes(newStatus)) {
        console.log(`Status không yêu cầu thông báo`);
        
        return { success: true, skipped: true, reason: 'Status không yêu cầu thông báo' };
      }
      
      console.log(`Bắt đầu gửi email thông báo thay đổi status lớp ${classId} từ "${oldStatus}" sang "${newStatus}"`);

      // Lấy thông tin lớp học với enrollments
      const classData = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          subject: true,
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          },
          enrollments: {
            where: {
              status: {
                in: ['studying', 'not_been_updated', 'graduated']
              }
            },
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true
                    }
                  },
                  parent: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          fullName: true,
                          email: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!classData) {
        throw new HttpException('Không tìm thấy lớp học', HttpStatus.NOT_FOUND);
      }

      if (classData.enrollments.length === 0) {
        console.log(`Lớp học không có học sinh đang học`);
        return { success: true, skipped: true, reason: 'Không có học sinh đang học' };
      }

      const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
        'active': {
          label: 'Đang hoạt động',
          color: '#4CAF50',
          icon: '✅'
        },
        'completed': {
          label: 'Đã hoàn thành',
          color: '#2196F3',
          icon: '🎓'
        },
        'suspended': {
          label: 'Tạm dừng',
          color: '#FF9800',
          icon: '⏸️'
        },
        'cancelled': {
          label: 'Đã hủy',
          color: '#F44336',
          icon: '❌'
        }
      };

      const statusInfo = statusLabels[newStatus] || {
        label: newStatus,
        color: '#757575',
        icon: '📌'
      };

      const className = classData.name || 'N/A';
      const subjectName = classData.subject?.name || 'N/A';
      const teacherName = classData.teacher?.user?.fullName;

      // Gửi email cho từng phụ huynh (group theo parent để tránh duplicate)
      const parentEmailMap = new Map<string, { parentName: string; students: string[] }>();

      for (const enrollment of classData.enrollments) {
        const parent = enrollment.student.parent;
        if (!parent || !parent.user?.email) {
          console.warn(`Học sinh ${enrollment.student.user.fullName} không có email phụ huynh`);
          continue;
        }

        const parentEmail = parent.user.email;
        const parentName = parent.user.fullName || 'Quý phụ huynh';
        const studentName = enrollment.student.user.fullName || 'N/A';

        if (!parentEmailMap.has(parentEmail)) {
          parentEmailMap.set(parentEmail, {
            parentName,
            students: [studentName]
          });
        } else {
          parentEmailMap.get(parentEmail)!.students.push(studentName);
        }
      }

      // Thêm job vào queue cho từng phụ huynh
      const emailResults = [];
      const jobPromises = [];

      for (const [email, data] of parentEmailMap.entries()) {
        try {
          const studentList = data.students.join(', ');

          // Thêm vào queue class_status_change_email
          const jobPromise = this.classStatusChangeEmailQueue.add(
            'send_class_status_change_notification',
            {
              to: email,
              parentName: data.parentName,
              studentName: studentList,
              className,
              subjectName,
              teacherName,
              oldStatus,
              newStatus,
              statusLabel: statusInfo.label,
              statusColor: statusInfo.color,
              statusIcon: statusInfo.icon,
              classId
            },
            {
              priority: 2,
              delay: 500,
              attempts: 3,
              timeout: 60000, // 60 giây timeout cho mỗi job
              backoff: {
                type: 'exponential',
                delay: 2000
              },
              removeOnComplete: 10,
              removeOnFail: 5
            }
          );

          jobPromises.push(jobPromise);

          emailResults.push({
            email,
            parentName: data.parentName,
            students: data.students,
            success: true
          });

          console.log(`Đã thêm job gửi email thông báo status cho ${data.parentName} (${email}) vào queue`);
        } catch (error: any) {
          console.error(`❌ Lỗi khi thêm job cho ${email}:`, error.message);
          emailResults.push({
            email,
            parentName: data.parentName,
            students: data.students,
            success: false,
            error: error.message
          });
        }
      }

      // Đợi tất cả jobs được thêm vào queue
      await Promise.all(jobPromises);

      const successCount = emailResults.filter(r => r.success).length;
      const failCount = emailResults.filter(r => !r.success).length;

      console.log(
        `Đã thêm ${successCount}/${parentEmailMap.size} job gửi email thông báo status vào queue\n` +
        `   - Thành công: ${successCount}\n` +
        `   - Thất bại: ${failCount}`
      );

      return {
        success: true,
        sentCount: successCount,
        failCount,
        totalParents: parentEmailMap.size,
        details: emailResults
      };
    } catch (error: any) {
      console.error(' Lỗi khi gửi email thông báo status:', error);
      // Không throw error để không ảnh hưởng đến update status
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gửi email thông báo chấp nhận yêu cầu tham gia lớp học
   */
  async sendClassRequestApprovalEmail(
    requestId: string,
    studentId: string,
    classId: string,
    parentEmail: string,
    parentName: string,
    studentName: string,
    className: string,
    subjectName: string,
    teacherName?: string,
    startDate?: string,
    schedule?: any,
    username?: string,
    password?: string
  ) {
    try {
      console.log(`📧 Thêm job gửi email chấp nhận yêu cầu cho: ${parentEmail}`);

      await this.classRequestEmailQueue.add(
        'send_approval_notification',
        {
          to: parentEmail,
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
          classId
        },
        {
          priority: 2,
          attempts: 3,
          timeout: 60000, // 60 giây timeout cho mỗi job
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          removeOnComplete: 10,
          removeOnFail: 5
        }
      );

      console.log(`✅ Đã thêm job gửi email chấp nhận vào queue cho: ${parentEmail}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        parentEmail,
        requestId,
      };
    } catch (error: any) {
      console.error(`❌ Lỗi khi thêm job email chấp nhận: ${error.message}`);
      // Không throw error để không ảnh hưởng đến quá trình approve
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gửi email thông báo từ chối yêu cầu tham gia lớp học
   */
  async sendClassRequestRejectionEmail(
    requestId: string,
    studentId: string,
    classId: string,
    parentEmail: string,
    parentName: string,
    studentName: string,
    className: string,
    subjectName: string,  
    reason: string
  ) {
    try {
      console.log(`📧 Thêm job gửi email từ chối yêu cầu cho: ${parentEmail}`);

      await this.classRequestEmailQueue.add(
        'send_rejection_notification',
        {
          to: parentEmail,
          studentName,
          parentName,
          className,
          subjectName,
          reason,
          requestId,
          studentId,
          classId,
        },
        {
          priority: 2,
          attempts: 3,
          timeout: 60000, // 60 giây timeout cho mỗi job
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          removeOnComplete: 10,
          removeOnFail: 5
        }
      );

      console.log(`✅ Đã thêm job gửi email từ chối vào queue cho: ${parentEmail}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        parentEmail,
        requestId,
      };
    } catch (error: any) {
      console.error(`❌ Lỗi khi thêm job email từ chối: ${error.message}`);
      // Không throw error để không ảnh hưởng đến quá trình reject
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gửi email thông báo lớp sắp bắt đầu cho center owner
   */
  async sendClassStartingNotificationEmail(
    to: string,
    data: {
      className: string;
      classCode?: string;
      subjectName: string;
      gradeName: string;
      daysRemaining: number;
      startDate: string;
      teacherName: string;
      roomName: string;
      scheduleText: string;
      currentStudents: number;
      maxStudents: number | string;
      hasTeacher: boolean;
      hasRoom: boolean;
      hasStudents: boolean;
    },
  ) {
    try {
      console.log(`📧 Thêm job gửi email thông báo lớp sắp bắt đầu cho: ${to}`);

      await this.emailNotificationQueue.add(
        'send_class_starting_notification',
        {
          to,
          ...data,
        },
        {
          priority: 2,
          attempts: 3,
          timeout: 60000, // 60 giây timeout cho mỗi job
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 10,
          removeOnFail: 5,
        },
      );

      console.log(`✅ Đã thêm job email thông báo lớp sắp bắt đầu vào queue cho: ${to}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        to,
      };
    } catch (error: any) {
      console.error(`❌ Lỗi khi thêm job email thông báo lớp sắp bắt đầu: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Gửi email thông báo lớp sắp kết thúc cho center owner
   */
  async sendClassEndingNotificationEmail(
    to: string,
    data: {
      className: string;
      classCode?: string;
      subjectName: string;
      gradeName: string;
      daysRemaining: number;
      endDate: string;
      teacherName: string;
      roomName: string;
      scheduleText: string;
      currentStudents: number;
      maxStudents: number | string;
    },
  ) {
    try {
      console.log(`📧 Thêm job gửi email thông báo lớp sắp kết thúc cho: ${to}`);

      await this.emailNotificationQueue.add(
        'send_class_ending_notification',
        {
          to,
          ...data,
        },
        {
          priority: 2,
          attempts: 3,
          timeout: 60000, // 60 giây timeout cho mỗi job
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 10,
          removeOnFail: 5,
        },
      );

      console.log(`✅ Đã thêm job email thông báo lớp sắp kết thúc vào queue cho: ${to}`);

      return {
        success: true,
        message: 'Email job đã được thêm vào queue',
        to,
      };
    } catch (error: any) {
      console.error(`❌ Lỗi khi thêm job email thông báo lớp sắp kết thúc: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Gửi email thông báo thay đổi lịch buổi học cho phụ huynh
   * @param sessionId ID của buổi học
   * @param type Loại thay đổi: 'rescheduled' (đổi lịch) hoặc 'cancelled' (hủy)
   * @param originalDate Ngày cũ (YYYY-MM-DD)
   * @param originalTime Giờ cũ (HH:mm - HH:mm)
   * @param newDate Ngày mới (YYYY-MM-DD) - chỉ có khi type = 'rescheduled'
   * @param newTime Giờ mới (HH:mm - HH:mm) - chỉ có khi type = 'rescheduled'
   * @param reason Lý do thay đổi (optional)
   */
  async sendSessionChangeEmail(
    sessionId: string,
    type: 'rescheduled' | 'cancelled',
    originalDate: string,
    originalTime: string,
    newDate?: string,
    newTime?: string,
    reason?: string
  ) {
    try {
      // Lấy thông tin buổi học và lớp
      const session = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: {
          class: {
            include: {
              subject: { select: { name: true } },
              teacher: {
                include: {
                  user: { select: { fullName: true } }
                }
              },
              enrollments: {
                where: { 
                  status: { in: ['studying', 'not_been_updated'] } // Lấy các enrollment đang học hoặc chưa cập nhật
                },
                include: {
                  student: {
                    include: {
                      user: { select: { fullName: true, email: true } },
                      parent: {
                        include: {
                          user: { select: { fullName: true, email: true } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!session || !session.class) {
        throw new HttpException('Không tìm thấy buổi học', HttpStatus.NOT_FOUND);
      }

      const className = session.class.name;
      const subjectName = session.class.subject?.name || '';
      const teacherName = session.class.teacher?.user?.fullName || '';

      console.log(`[SessionChangeEmail] Lấy thông tin cho session ${sessionId}`);
      console.log(`  - Lớp: ${className}`);
      console.log(`  - Số enrollments: ${session.class.enrollments?.length || 0}`);

      // Lấy danh sách phụ huynh (group by email để tránh gửi trùng)
      const parentEmailMap = new Map<string, {
        parentName: string;
        studentNames: string[];
      }>();

      for (const enrollment of session.class.enrollments || []) {
        const student = enrollment.student;
        if (!student) {
          console.log(`  - Enrollment: Không có student`);
          continue;
        }

        const parent = student.parent;
        if (!parent) {
          console.log(`  - Student: Không có parent`);
          continue;
        }

        const parentUser = parent.user;
        if (!parentUser) {
          console.log(`  - Parent: Không có user`);
          continue;
        }

        if (!parentUser.email) {
          console.log(`  - Parent user: Không có email`);
          continue;
        }

        const studentName = student.user?.fullName || '';
        if (parentEmailMap.has(parentUser.email)) {
          const existing = parentEmailMap.get(parentUser.email)!;
          existing.studentNames.push(studentName);
        } else {
          parentEmailMap.set(parentUser.email, {
            parentName: parentUser.fullName,
            studentNames: [studentName]
          });
        }
      }

      console.log(`  - Tổng số phụ huynh có email: ${parentEmailMap.size}`);

      // Nếu không có phụ huynh nào, log và return
      if (parentEmailMap.size === 0) {
        console.warn(`Không tìm thấy phụ huynh nào có email cho session ${sessionId}`);
        return {
          success: true,
          message: 'Không có phụ huynh nào để gửi email',
          sentCount: 0,
        };
      }

      // Gửi email cho từng phụ huynh
      const emailJobs = Array.from(parentEmailMap.entries()).map(([email, data]) => {
        return this.sessionChangeEmailQueue.add(
          'send_session_change_notification',
          {
            to: email,
            type,
            parentName: data.parentName,
            studentNames: data.studentNames,
            className,
            subjectName,
            teacherName,
            originalDate,
            originalTime,
            newDate: newDate || '',
            newTime: newTime || '',
            reason: reason || '',
            sessionId,
            classId: session.classId
          },
          {
            priority: 1,
            attempts: 3,
            timeout: 60000, // 60 giây timeout cho mỗi job
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: 10,
            removeOnFail: 5,
          }
        );
      });

      await Promise.all(emailJobs);

      console.log(`Đã thêm ${emailJobs.length} job email thông báo thay đổi lịch vào queue cho session ${sessionId}`);

      return {
        success: true,
        message: 'Email jobs đã được thêm vào queue',
        sentCount: emailJobs.length,
      };
    } catch (error: any) {
      console.error(`Lỗi khi gửi email thông báo thay đổi lịch: ${error.message}`);
      throw new HttpException(
        `Lỗi khi gửi email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
