import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import emailUtil from '../../../utils/email.util';
import { PrismaService } from '../../../db/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailNotificationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email_notification') private readonly emailNotificationQueue: Queue
  
  ) {}

  /**
   * Gửi email thông báo gán giáo viên vào lớp học (trực tiếp, không qua queue)
   * Chỉ sử dụng khi cần gửi email ngay lập tức
   */
  async sendTeacherAssignmentEmailDirect(classId: string, teacherId: string) {
    try {
      // Lấy thông tin chi tiết lớp học và giáo viên
      const classData = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          },
          subject: {
            select: {
              name: true
            }
          },
          room: {
            select: {
              name: true
            }
          },
          grade: {
            select: {
              name: true,
              level: true
            }
          }
        }
      });

      if (!classData) {
        throw new Error('Không tìm thấy thông tin lớp học');
      }

      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true
            }
          }
        }
      });

      if (!teacher) {
        throw new Error('Không tìm thấy thông tin giáo viên');
      }
      
      // Format lịch học
      const formatSchedule = (schedule: any) => {
        let scheduleArray = schedule;
        
        // Nếu schedule là string JSON, parse nó
        if (typeof schedule === 'string') {
          try {
            scheduleArray = JSON.parse(schedule);
          } catch (error) {
            return 'Chưa có lịch học';
          }
        }
        
        // Nếu schedule có property 'schedules', lấy nó
        if (scheduleArray && typeof scheduleArray === 'object' && scheduleArray.schedules) {
          scheduleArray = scheduleArray.schedules;
        }
        
        if (!scheduleArray || !Array.isArray(scheduleArray)) {
          return 'Chưa có lịch học';
        }

        const dayNames = {
          'monday': 'Thứ 2',
          'tuesday': 'Thứ 3', 
          'wednesday': 'Thứ 4',
          'thursday': 'Thứ 5',
          'friday': 'Thứ 6',
          'saturday': 'Thứ 7',
          'sunday': 'Chủ nhật'
        };

        
        
        const result = scheduleArray.map((item: any) => {
          // Hỗ trợ cả 'day' và 'dayOfWeek' để tương thích
          const dayKey = item.day || item.dayOfWeek;
          const day = dayNames[dayKey as keyof typeof dayNames] || dayKey;
          const startTime = item.startTime || 'Chưa xác định';
          const endTime = item.endTime || 'Chưa xác định';
          return `${day}: ${startTime} - ${endTime}`;
        }).join('<br>');
        
        return result;
      };

      // Tạo HTML template cho email
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thông báo phân công lớp học</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .title {
              font-size: 20px;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #6b7280;
              font-size: 14px;
            }
            .content {
              margin-bottom: 30px;
            }
            .info-section {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #3b82f6;
            }
            .info-title {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
            }
            .info-item {
              margin-bottom: 10px;
              display: flex;
              align-items: center;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
              min-width: 120px;
            }
            .info-value {
              color: #6b7280;
            }
            .schedule-section {
              background-color: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #0ea5e9;
            }
            .schedule-item {
              margin-bottom: 8px;
              padding: 8px 12px;
              background-color: white;
              border-radius: 4px;
              border-left: 3px solid #0ea5e9;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .highlight {
              background-color: #fef3c7;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📚 Trung Tâm Giáo Dục</div>
              <div class="title">Thông báo phân công lớp học</div>
              <div class="subtitle">Bạn đã được phân công làm giáo viên phụ trách lớp học mới</div>
            </div>

            <div class="content">
              <div class="info-section">
                <div class="info-title">📋 Thông tin lớp học</div>
                <div class="info-item">
                  <span class="info-label">Tên lớp:</span>
                  <span class="info-value"><span class="highlight">${classData.name}</span></span>
                </div>
                <div class="info-item">
                  <span class="info-label">Mã lớp:</span>
                  <span class="info-value"><span class="highlight">${classData.id.slice(-8).toUpperCase()}</span></span>
                </div>
                <div class="info-item">
                  <span class="info-label">Môn học:</span>
                  <span class="info-value">${classData.subject?.name || 'Chưa xác định'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Khối lớp:</span>
                  <span class="info-value">${classData.grade ? `Khối ${classData.grade.level} - ${classData.grade.name}` : 'Chưa xác định'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phòng học:</span>
                  <span class="info-value">${classData.room?.name || 'Chưa phân công'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Năm học:</span>
                  <span class="info-value">${classData.academicYear || 'Chưa xác định'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Trạng thái:</span>
                  <span class="info-value">${this.getStatusLabel(classData.status)}</span>
                </div>
              </div>

              ${classData.recurringSchedule ? `
                <div class="schedule-section">
                  <div class="info-title">📅 Lịch học hàng tuần</div>
                  ${formatSchedule(classData.recurringSchedule)}
                </div>
              ` : ''}

              <div class="info-section">
                <div class="info-title">👨‍🏫 Thông tin giáo viên</div>
                <div class="info-item">
                  <span class="info-label">Họ tên:</span>
                  <span class="info-value">${teacher.user?.fullName || 'Chưa cập nhật'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${teacher.user?.email || 'Chưa cập nhật'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Số điện thoại:</span>
                  <span class="info-value">${teacher.user?.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>

              ${classData.description ? `
                <div class="info-section">
                  <div class="info-title">📝 Mô tả lớp học</div>
                  <div style="color: #6b7280; line-height: 1.6;">
                    ${classData.description.replace(/\n/g, '<br>')}
                  </div>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="button">Xem chi tiết lớp học</a>
              </div>
            </div>

            <div class="footer">
              <p>📧 Email này được gửi tự động từ hệ thống quản lý trung tâm giáo dục</p>
              <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với quản trị viên</p>
              <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Trung Tâm Giáo Dục. Tất cả quyền được bảo lưu.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Gửi email
      const emailSubject = `📚 Thông báo phân công lớp học: ${classData.name}`;
      const teacherEmail = teacher.user?.email;

      if (!teacherEmail) {
        throw new Error('Không tìm thấy email của giáo viên');
      }

      await emailUtil(teacherEmail, emailSubject, emailHtml);

      return {
        success: true,
        message: 'Email thông báo đã được gửi thành công',
        data: {
          teacherEmail,
          classId: classData.id,
          className: classData.name
        }
      };

    } catch (error) {
      throw new Error(`Không thể gửi email thông báo: ${error.message}`);
    }
  }

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
   * Gửi email hủy lớp cho giáo viên cũ
   */
  async sendTeacherCancellationEmailDirect(classId: string, teacherId: string) {
    try {
      // Lấy thông tin lớp và giáo viên
      const classData = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
          subject: true,
          grade: true,
        },
      });

      if (!classData) {
        throw new Error(`Không tìm thấy lớp học với ID: ${classId}`);
      }

      if (!classData.teacher) {
        throw new Error(`Lớp học ${classData.name} chưa có giáo viên`);
      }

      if (!classData.teacher.user?.email) {
        throw new Error(`Giáo viên ${classData.teacher.user?.fullName} không có email`);
      }

      // Format lịch học
      const formatSchedule = (schedule: any) => {
        let scheduleArray = schedule;
        
        // Nếu schedule là string JSON, parse nó
        if (typeof schedule === 'string') {
          try {
            scheduleArray = JSON.parse(schedule);
          } catch (error) {
            return 'Chưa có lịch học';
          }
        }
        
        // Nếu schedule có property 'schedules', lấy nó
        if (scheduleArray && typeof scheduleArray === 'object' && scheduleArray.schedules) {
          scheduleArray = scheduleArray.schedules;
        }
        
        if (!scheduleArray || !Array.isArray(scheduleArray)) {
          return 'Chưa có lịch học';
        }

        const dayNames = {
          'monday': 'Thứ 2',
          'tuesday': 'Thứ 3', 
          'wednesday': 'Thứ 4',
          'thursday': 'Thứ 5',
          'friday': 'Thứ 6',
          'saturday': 'Thứ 7',
          'sunday': 'Chủ nhật'
        };

        const result = scheduleArray.map((item: any) => {
          // Hỗ trợ cả 'day' và 'dayOfWeek' để tương thích
          const dayKey = item.day || item.dayOfWeek;
          const day = dayNames[dayKey as keyof typeof dayNames] || dayKey;
          const startTime = item.startTime || 'Chưa xác định';
          const endTime = item.endTime || 'Chưa xác định';
          return `${day}: ${startTime} - ${endTime}`;
        }).join('<br>');
        
        return result;
      };

      // Tạo HTML template cho email hủy lớp
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thông báo hủy phân công lớp học</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .email-container {
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #dc3545, #c82333);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .info-section {
              background-color: #f8f9fa;
              border-left: 4px solid #dc3545;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            .info-row {
              display: flex;
              margin-bottom: 10px;
              align-items: center;
            }
            .info-label {
              font-weight: 600;
              color: #495057;
              min-width: 120px;
              margin-right: 10px;
            }
            .info-value {
              color: #212529;
              flex: 1;
            }
            .schedule-section {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
            .schedule-title {
              font-weight: 600;
              color: #856404;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
            }
            .schedule-content {
              color: #856404;
              line-height: 1.8;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #6c757d;
              font-size: 14px;
              border-top: 1px solid #dee2e6;
            }
            .warning-icon {
              color: #dc3545;
              margin-right: 8px;
            }
            .calendar-icon {
              color: #856404;
              margin-right: 8px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🚫 Thông báo hủy phân công lớp học</h1>
            </div>
            
            <div class="content">
              <p>Xin chào <strong>${classData.teacher.user.fullName}</strong>,</p>
              
              <p>Chúng tôi xin thông báo rằng bạn đã được hủy phân công giảng dạy lớp học sau:</p>
              
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">📚 Tên lớp:</span>
                  <span class="info-value"><strong>${classData.name}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">🔢 Mã lớp:</span>
                  <span class="info-value"><strong>${classData.id}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">📖 Môn học:</span>
                  <span class="info-value">${classData.subject?.name || 'Chưa xác định'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🎓 Khối lớp:</span>
                  <span class="info-value">${classData.grade?.name || 'Chưa xác định'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">👥 Số học sinh:</span>
                  <span class="info-value">${classData.maxStudents || 'Chưa xác định'} học sinh</span>
                </div>
              </div>
              
              <div class="schedule-section">
                <div class="schedule-title">
                  <span class="calendar-icon">📅</span>
                  Lịch học hàng tuần
                </div>
                <div class="schedule-content">
                  ${formatSchedule(classData.recurringSchedule)}
                </div>
              </div>
              
              <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #721c24; font-weight: 600;">
                  <span class="warning-icon">⚠️</span>
                  Lưu ý: Bạn không còn phụ trách lớp học này nữa. Vui lòng cập nhật lịch giảng dạy của mình.
                </p>
              </div>
              
              <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với quản lý trung tâm.</p>
              
              <p>Trân trọng,<br>
              <strong>Ban quản lý trung tâm giáo dục</strong></p>
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động từ hệ thống quản lý trung tâm giáo dục.</p>
              <p>Vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Gửi email
      await emailUtil(
        classData.teacher.user.email,
        `🚫 Hủy phân công lớp học: ${classData.name}`,
        emailHtml
      );

      console.log(`📧 Email hủy lớp đã được gửi cho giáo viên ${classData.teacher.user.fullName} (${classData.teacher.user.email})`);
      
    } catch (error) {
      throw new Error(`Không thể gửi email hủy lớp: ${error.message}`);
    }
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

      // Kiểm tra các học sinh đã được gửi email chưa
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

      // Lọc ra các học sinh chưa được gửi email
      const alreadySentStudentIds = attendanceRecords
        .filter(record => record.isSent)
        .map(record => record.studentId);

      const studentsToSendEmail = studentIds.filter(
        id => !alreadySentStudentIds.includes(id)
      );

      if (studentsToSendEmail.length === 0) {
        return {
          success: true,
          sentCount: 0,
          alreadySentCount: alreadySentStudentIds.length,
          totalStudents: studentIds.length,
          message: 'Tất cả học sinh đã được gửi email thông báo trước đó',
          details: []
        };
      }

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

      // Lấy thông tin các học sinh chưa được gửi email và phụ huynh
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

      // Định dạng dữ liệu chung
      const absenceDate = new Date(session.sessionDate).toLocaleDateString('vi-VN');
      const sessionTime = `${session.startTime} - ${session.endTime}`;
      const subjectName = session.class?.subject?.name || 'N/A';
      const className = session.class?.name || 'N/A';
      const teacherName = teacher.user?.fullName || 'N/A';

      // Gửi email cho từng phụ huynh
      const emailResults = [];
      
      for (const student of students) {
        const parentEmail = student.parent?.user?.email;
        
        if (!parentEmail) {
          console.warn(
            `⚠️ Không tìm thấy email phụ huynh cho học sinh ${student.user?.fullName} (ID: ${student.id})`
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
          // Thêm job vào queue để gửi email
          await this.emailNotificationQueue.add(
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
              // Thêm thông tin để cập nhật isSent sau khi gửi thành công
              sessionId,
              studentId: student.id
            },
            {
              delay: 5000,
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000
              }
            }
          );

          // Cập nhật trạng thái isSent trong database
          await this.prisma.studentSessionAttendance.updateMany({
            where: {
              sessionId,
              studentId: student.id,
              status: 'absent'
            },
            data: {
              isSent: true,
              sentAt: new Date()
            }
          });

          console.log(
            `✅ Đã thêm email thông báo vắng mặt cho học sinh ${student.user?.fullName} vào queue và cập nhật trạng thái`
          );

          emailResults.push({
            studentId: student.id,
            studentName: student.user?.fullName,
            parentEmail,
            success: true
          });
        } catch (error) {
          console.error(
            `❌ Lỗi khi thêm email cho học sinh ${student.user?.fullName}:`,
            error
          );
          emailResults.push({
            studentId: student.id,
            studentName: student.user?.fullName,
            success: false,
            reason: error.message
          });
        }
      }

      // Tính toán kết quả
      const successCount = emailResults.filter(r => r.success).length;
      const failCount = emailResults.filter(r => !r.success).length;

      console.log(
        `📊 Kết quả gửi email: ${successCount} thành công, ${failCount} thất bại, ${alreadySentStudentIds.length} đã gửi trước đó trong tổng số ${studentIds.length} học sinh`
      );

      return {
        success: true,
        sentCount: successCount,
        failCount,
        alreadySentCount: alreadySentStudentIds.length,
        totalStudents: studentIds.length,
        details: emailResults
      };
    } catch (error) {
      console.error('❌ Lỗi khi gửi email thông báo vắng học:', error);
      throw new HttpException(
        error.message || 'Lỗi khi gửi email thông báo vắng học',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
