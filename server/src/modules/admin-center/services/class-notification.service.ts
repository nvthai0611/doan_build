import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { AlertService } from './alert.service';
import { AlertType, AlertSeverity } from '../dto/alert.dto';
import { EmailNotificationService } from '../../shared/services/email-notification.service';

@Injectable()
export class ClassNotificationService {
  private readonly logger = new Logger(ClassNotificationService.name);

  constructor(
    private prisma: PrismaService,
    private alertService: AlertService,
    private emailNotificationService: EmailNotificationService,
  ) {}

  /**
   * Kiểm tra và tạo thông báo cho các lớp sắp bắt đầu
   */
  async checkClassesStartingSoon() {
    this.logger.log('🔍 Đang kiểm tra các lớp sắp bắt đầu...');

    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Các mốc thời gian cần thông báo: 14, 7, 3, 1 ngày trước
      const notificationDays = [3];

      for (const daysBefore of notificationDays) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + daysBefore);

        // Tìm các lớp có ngày bắt đầu trong khoảng targetDate ± 1 ngày
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const classes = await this.prisma.class.findMany({
          where: {
            status: {
              in: ['ready', 'active'],
            },
            OR: [
              {
                actualStartDate: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              {
                AND: [
                  { actualStartDate: null },
                  {
                    expectedStartDate: {
                      gte: startOfDay,
                      lte: endOfDay,
                    },
                  },
                ],
              },
            ],
          },
          include: {
            subject: true,
            grade: true,
            teacher: {
              include: {
                user: true,
              },
            },
            room: true,
            _count: {
              select: {
                enrollments: {
                  where: {
                    status: {
                      in: ['studying', 'not_been_updated'],
                    },
                  },
                },
              },
            },
          },
        });

        this.logger.log(
          `📅 Tìm thấy ${classes.length} lớp sẽ bắt đầu sau ${daysBefore} ngày`,
        );

        for (const classItem of classes) {
          await this.createClassStartingAlert(classItem, daysBefore);
        }
      }

      this.logger.log('✅ Hoàn thành kiểm tra lớp sắp bắt đầu');
    } catch (error) {
      this.logger.error('❌ Lỗi khi kiểm tra lớp sắp bắt đầu:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra và tạo thông báo cho các lớp sắp kết thúc
   */
  async checkClassesEndingSoon() {
    this.logger.log('🔍 Đang kiểm tra các lớp sắp kết thúc...');

    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Các mốc thời gian cần thông báo: 30, 14, 7 ngày trước
      const notificationDays = [30, 14, 3];

      for (const daysBefore of notificationDays) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + daysBefore);

        // Tìm các lớp có ngày kết thúc trong khoảng targetDate ± 1 ngày
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const classes = await this.prisma.class.findMany({
          where: {
            status: {
              in: ['ready', 'active'],
            },
            actualEndDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            subject: true,
            grade: true,
            teacher: {
              include: {
                user: true,
              },
            },
            room: true,
            _count: {
              select: {
                enrollments: {
                  where: {
                    status: {
                      in: ['studying', 'not_been_updated'],
                    },
                  },
                },
              },
            },
          },
        });

        this.logger.log(
          `📅 Tìm thấy ${classes.length} lớp sẽ kết thúc sau ${daysBefore} ngày`,
        );

        for (const classItem of classes) {
          await this.createClassEndingAlert(classItem, daysBefore);
        }
      }

      this.logger.log('✅ Hoàn thành kiểm tra lớp sắp kết thúc');
    } catch (error) {
      this.logger.error('❌ Lỗi khi kiểm tra lớp sắp kết thúc:', error);
      throw error;
    }
  }

  /**
   * Tạo alert và gửi email cho lớp sắp bắt đầu
   */
  private async createClassStartingAlert(
    classItem: any,
    daysRemaining: number,
  ) {
    try {
      // Kiểm tra xem đã tạo alert này chưa
      // Query alerts cùng type và check payload
      const existingAlerts = await this.prisma.alert.findMany({
        where: {
          alertType: 'class_starting_soon',
          message: {
            contains: `${daysRemaining} ngày`,
          },
        },
        take: 10,
      });

      const existingAlert = existingAlerts.find((alert: any) => {
        const payload = alert.payload as any;
        return payload && payload.classId === classItem.id && payload.daysRemaining === daysRemaining;
      });

      if (existingAlert) {
        this.logger.log(
          `⚠️ Alert đã tồn tại cho lớp ${classItem.name} (${daysRemaining} ngày)`,
        );
        return;
      }

      // Tính severity dựa trên số ngày còn lại
      let severity = AlertSeverity.MEDIUM;
      if (daysRemaining <= 3) {
        severity = AlertSeverity.HIGH;
      }

      // Format ngày bắt đầu
      const startDate =
        classItem.actualStartDate || classItem.expectedStartDate;
      const startDateStr = startDate
        ? new Date(startDate).toLocaleDateString('vi-VN')
        : 'Chưa xác định';

      // Format lịch học
      const scheduleText = this.formatSchedule(classItem.recurringSchedule);

      // Tạo title và message
      const title = `Lớp "${classItem.name}" sẽ bắt đầu sau ${daysRemaining} ngày`;
      const message = this.buildStartingMessage(
        classItem,
        daysRemaining,
        startDateStr,
        scheduleText,
      );

      // Tạo payload
      const payload = {
        classId: classItem.id,
        className: classItem.name,
        classCode: classItem.classCode,
        daysRemaining,
        startDate: startDate ? startDate.toISOString() : null,
        notificationType: 'class_starting',
      };

      // Tạo alert
      await this.alertService.createAlert({
        alertType: 'class_starting_soon' as AlertType,
        title,
        message,
        severity,
        payload,
      });

      // Gửi email cho center owners
      await this.sendClassStartingEmail(classItem, daysRemaining, startDateStr, scheduleText);

      this.logger.log(
        `✅ Đã tạo alert cho lớp ${classItem.name} (${daysRemaining} ngày)`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Lỗi khi tạo alert cho lớp ${classItem.name}:`,
        error,
      );
    }
  }

  /**
   * Tạo alert và gửi email cho lớp sắp kết thúc
   */
  private async createClassEndingAlert(
    classItem: any,
    daysRemaining: number,
  ) {
    try {
      // Kiểm tra xem đã tạo alert này chưa
      // Query alerts cùng type và check payload
      const existingAlerts = await this.prisma.alert.findMany({
        where: {
          alertType: 'class_ending_soon',
          message: {
            contains: `${daysRemaining} ngày`,
          },
        },
        take: 10,
      });

      const existingAlert = existingAlerts.find((alert: any) => {
        const payload = alert.payload as any;
        return payload && payload.classId === classItem.id && payload.daysRemaining === daysRemaining;
      });

      if (existingAlert) {
        this.logger.log(
          `⚠️ Alert đã tồn tại cho lớp ${classItem.name} (${daysRemaining} ngày)`,
        );
        return;
      }

      // Tính severity dựa trên số ngày còn lại
      let severity = AlertSeverity.MEDIUM;
      if (daysRemaining <= 7) {
        severity = AlertSeverity.HIGH;
      }

      // Format ngày kết thúc
      const endDateStr = classItem.actualEndDate
        ? new Date(classItem.actualEndDate).toLocaleDateString('vi-VN')
        : 'Chưa xác định';

      // Format lịch học
      const scheduleText = this.formatSchedule(classItem.recurringSchedule);

      // Tạo title và message
      const title = `Lớp "${classItem.name}" sẽ kết thúc sau ${daysRemaining} ngày`;
      const message = this.buildEndingMessage(
        classItem,
        daysRemaining,
        endDateStr,
        scheduleText,
      );

      // Tạo payload
      const payload = {
        classId: classItem.id,
        className: classItem.name,
        classCode: classItem.classCode,
        daysRemaining,
        endDate: classItem.actualEndDate
          ? classItem.actualEndDate.toISOString()
          : null,
        notificationType: 'class_ending',
      };

      // Tạo alert
      await this.alertService.createAlert({
        alertType: 'class_ending_soon' as AlertType,
        title,
        message,
        severity,
        payload,
      });

      // Gửi email cho center owners
      await this.sendClassEndingEmail(classItem, daysRemaining, endDateStr, scheduleText);

      this.logger.log(
        `✅ Đã tạo alert cho lớp ${classItem.name} (${daysRemaining} ngày)`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Lỗi khi tạo alert cho lớp ${classItem.name}:`,
        error,
      );
    }
  }

  /**
   * Build message cho lớp sắp bắt đầu
   */
  private buildStartingMessage(
    classItem: any,
    daysRemaining: number,
    startDate: string,
    scheduleText: string,
  ): string {
    const warnings = [];
    
    if (!classItem.teacher) {
      warnings.push('⚠️ Chưa phân công giáo viên');
    }
    
    if (!classItem.room) {
      warnings.push('⚠️ Chưa phân công phòng học');
    }
    
    if (classItem._count.enrollments === 0) {
      warnings.push('⚠️ Chưa có học sinh đăng ký');
    }

    let message = `Lớp "${classItem.name}" (${classItem.subject?.name || 'N/A'}) sẽ bắt đầu sau ${daysRemaining} ngày (${startDate}).\n\n`;
    message += `📋 Thông tin lớp:\n`;
    message += `- Môn học: ${classItem.subject?.name || 'N/A'}\n`;
    message += `- Khối: ${classItem.grade?.name || 'N/A'}\n`;
    message += `- Giáo viên: ${classItem.teacher?.user?.fullName || 'Chưa phân công'}\n`;
    message += `- Phòng học: ${classItem.room?.name || 'Chưa phân công'}\n`;
    message += `- Lịch học: ${scheduleText || 'Chưa cập nhật'}\n`;
    message += `- Học sinh: ${classItem._count.enrollments}/${classItem.maxStudents || 'N/A'}\n\n`;

    if (warnings.length > 0) {
      message += `🔔 Cần chuẩn bị:\n${warnings.join('\n')}\n`;
    }

    return message;
  }

  /**
   * Build message cho lớp sắp kết thúc
   */
  private buildEndingMessage(
    classItem: any,
    daysRemaining: number,
    endDate: string,
    scheduleText: string,
  ): string {
    let message = `Lớp "${classItem.name}" (${classItem.subject?.name || 'N/A'}) sẽ kết thúc sau ${daysRemaining} ngày (${endDate}).\n\n`;
    message += `📋 Thông tin lớp:\n`;
    message += `- Môn học: ${classItem.subject?.name || 'N/A'}\n`;
    message += `- Khối: ${classItem.grade?.name || 'N/A'}\n`;
    message += `- Giáo viên: ${classItem.teacher?.user?.fullName || 'Chưa phân công'}\n`;
    message += `- Phòng học: ${classItem.room?.name || 'Chưa phân công'}\n`;
    message += `- Lịch học: ${scheduleText || 'Chưa cập nhật'}\n`;
    message += `- Học sinh: ${classItem._count.enrollments}/${classItem.maxStudents || 'N/A'}\n\n`;
    message += `🔔 Cần chuẩn bị:\n`;
    message += `- Chuẩn bị đánh giá cuối khóa\n`;
    message += `- Chuẩn bị chứng chỉ/giấy chứng nhận (nếu có)\n`;
    message += `- Thông báo cho phụ huynh về việc kết thúc lớp\n`;

    return message;
  }

  /**
   * Format recurring schedule thành text
   */
  private formatSchedule(recurringSchedule: any): string {
    if (!recurringSchedule || !recurringSchedule.schedules) {
      return '';
    }

    const dayNames: { [key: string]: string } = {
      monday: 'Thứ 2',
      tuesday: 'Thứ 3',
      wednesday: 'Thứ 4',
      thursday: 'Thứ 5',
      friday: 'Thứ 6',
      saturday: 'Thứ 7',
      sunday: 'Chủ nhật',
    };

    return recurringSchedule.schedules
      .map((schedule: any) => {
        const dayName = dayNames[schedule.day] || schedule.day;
        return `${dayName}: ${schedule.startTime} - ${schedule.endTime}`;
      })
      .join(', ');
  }

  /**
   * Gửi email thông báo lớp sắp bắt đầu
   */
  private async sendClassStartingEmail(
    classItem: any,
    daysRemaining: number,
    startDate: string,
    scheduleText: string,
  ) {
    try {
      // Lấy tất cả center owners
      const centerOwners = await this.prisma.user.findMany({
        where: {
          role: 'center_owner',
          isActive: true,
        },
      });

      if (centerOwners.length === 0) {
        this.logger.warn('⚠️ Không tìm thấy center owner nào để gửi email');
        return;
      }

      // Gửi email cho từng center owner
      for (const owner of centerOwners) {
        await this.emailNotificationService.sendClassStartingNotificationEmail(
          owner.email,
          {
            className: classItem.name,
            classCode: classItem.classCode,
            subjectName: classItem.subject?.name || 'N/A',
            gradeName: classItem.grade?.name || 'N/A',
            daysRemaining,
            startDate,
            teacherName: classItem.teacher?.user?.fullName || 'Chưa phân công',
            roomName: classItem.room?.name || 'Chưa phân công',
            scheduleText,
            currentStudents: classItem._count.enrollments,
            maxStudents: classItem.maxStudents || 'N/A',
            hasTeacher: !!classItem.teacher,
            hasRoom: !!classItem.room,
            hasStudents: classItem._count.enrollments > 0,
          },
        );
      }

      this.logger.log(
        `📧 Đã gửi email thông báo cho ${centerOwners.length} center owner(s)`,
      );
    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi email thông báo:', error);
    }
  }

  /**
   * Gửi email thông báo lớp sắp kết thúc
   */
  private async sendClassEndingEmail(
    classItem: any,
    daysRemaining: number,
    endDate: string,
    scheduleText: string,
  ) {
    try {
      // Lấy tất cả center owners
      const centerOwners = await this.prisma.user.findMany({
        where: {
          role: 'center_owner',
          isActive: true,
        },
      });

      if (centerOwners.length === 0) {
        this.logger.warn('⚠️ Không tìm thấy center owner nào để gửi email');
        return;
      }

      // Gửi email cho từng center owner
      for (const owner of centerOwners) {
        await this.emailNotificationService.sendClassEndingNotificationEmail(
          owner.email,
          {
            className: classItem.name,
            classCode: classItem.classCode,
            subjectName: classItem.subject?.name || 'N/A',
            gradeName: classItem.grade?.name || 'N/A',
            daysRemaining,
            endDate,
            teacherName: classItem.teacher?.user?.fullName || 'Chưa phân công',
            roomName: classItem.room?.name || 'Chưa phân công',
            scheduleText,
            currentStudents: classItem._count.enrollments,
            maxStudents: classItem.maxStudents || 'N/A',
          },
        );
      }

      this.logger.log(
        `📧 Đã gửi email thông báo cho ${centerOwners.length} center owner(s)`,
      );
    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi email thông báo:', error);
    }
  }
}
