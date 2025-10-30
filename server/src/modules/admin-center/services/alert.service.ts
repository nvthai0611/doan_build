import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateAlertDto, UpdateAlertDto, GetAlertsDto, AlertType, AlertSeverity } from '../dto/alert.dto';

@Injectable()
export class AlertService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo alert mới
   */
  async createAlert(createAlertDto: CreateAlertDto) {
    try {
      const alert = await this.prisma.alert.create({
        data: {
          alertType: createAlertDto.alertType,
          title: createAlertDto.title,
          message: createAlertDto.message,
          severity: createAlertDto.severity || AlertSeverity.MEDIUM,
          payload: createAlertDto.payload || null,
          isRead: false,
          processed: false,
        },
      });

      return {
        data: alert,
        message: 'Tạo cảnh báo thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi tạo cảnh báo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách alerts với filter & pagination
   */
  async getAlerts(params: GetAlertsDto) {
    try {
      const page = params.page || 1;
      const limit = params.limit || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const where: any = {};
      
      if (params.alertType) {
        where.alertType = params.alertType;
      }
      
      if (params.severity) {
        where.severity = params.severity;
      }
      
      if (params.isRead !== undefined) {
        where.isRead = params.isRead;
      }
      
      if (params.processed !== undefined) {
        where.processed = params.processed;
      }

      // Get total count
      const total = await this.prisma.alert.count({ where });

      // Get alerts
      const alerts = await this.prisma.alert.findMany({
        where,
        orderBy: [
          { isRead: 'asc' }, // Unread first
          { triggeredAt: 'desc' }, // Newest first
        ],
        skip,
        take: limit,
      });

      // Get unread count
      const unreadCount = await this.prisma.alert.count({
        where: { isRead: false },
      });

      return {
        data: alerts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          unreadCount,
        },
        message: 'Lấy danh sách cảnh báo thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách cảnh báo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy số lượng alerts chưa đọc
   */
  async getUnreadCount() {
    try {
      const count = await this.prisma.alert.count({
        where: { isRead: false },
      });

      return {
        data: { count },
        message: 'Lấy số lượng cảnh báo chưa đọc thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy số lượng cảnh báo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật alert (đánh dấu đã đọc/đã xử lý)
   */
  async updateAlert(id: string, updateAlertDto: UpdateAlertDto) {
    try {
      // Check if alert exists
      const alert = await this.prisma.alert.findUnique({
        where: { id: BigInt(id) },
      });

      if (!alert) {
        throw new NotFoundException('Không tìm thấy cảnh báo');
      }

      // Build update data
      const data: any = {};
      
      if (updateAlertDto.isRead !== undefined) {
        data.isRead = updateAlertDto.isRead;
      }
      
      if (updateAlertDto.processed !== undefined) {
        data.processed = updateAlertDto.processed;
        if (updateAlertDto.processed) {
          data.processedAt = new Date();
        }
      }

      // Update alert
      const updatedAlert = await this.prisma.alert.update({
        where: { id: BigInt(id) },
        data,
      });

      return {
        data: updatedAlert,
        message: 'Cập nhật cảnh báo thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật cảnh báo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Đánh dấu tất cả alerts là đã đọc
   */
  async markAllAsRead() {
    try {
      const result = await this.prisma.alert.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });

      return {
        data: { count: result.count },
        message: `Đã đánh dấu ${result.count} cảnh báo là đã đọc`,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi đánh dấu đã đọc',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa alert
   */
  async deleteAlert(id: string) {
    try {
      // Check if alert exists
      const alert = await this.prisma.alert.findUnique({
        where: { id: BigInt(id) },
      });

      if (!alert) {
        throw new NotFoundException('Không tìm thấy cảnh báo');
      }

      await this.prisma.alert.delete({
        where: { id: BigInt(id) },
      });

      return {
        message: 'Xóa cảnh báo thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa cảnh báo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Helper: Tạo alert khi có parent mới đăng ký
   */
  async createParentRegistrationAlert(parentData: any) {
    return this.createAlert({
      alertType: AlertType.PARENT_REGISTRATION,
      title: 'Phụ huynh mới đăng ký',
      message: `Phụ huynh ${parentData.fullName} (${parentData.email}) vừa đăng ký tài khoản với ${parentData.childrenCount} con.`,
      severity: AlertSeverity.MEDIUM,
      payload: {
        parentId: parentData.id,
        email: parentData.email,
        phone: parentData.phone,
        childrenCount: parentData.childrenCount,
      },
    });
  }

  /**
   * Helper: Tạo alert khi có leave request mới
   */
  async createLeaveRequestAlert(leaveRequestData: any) {
    return this.createAlert({
      alertType: AlertType.LEAVE_REQUEST,
      title: 'Đơn xin nghỉ mới',
      message: `${leaveRequestData.requesterType} ${leaveRequestData.requesterName} xin nghỉ từ ${leaveRequestData.startDate} đến ${leaveRequestData.endDate}. Lý do: ${leaveRequestData.reason}`,
      severity: AlertSeverity.HIGH,
      payload: {
        leaveRequestId: leaveRequestData.id,
        requesterId: leaveRequestData.requesterId,
        requesterType: leaveRequestData.requesterType,
        startDate: leaveRequestData.startDate,
        endDate: leaveRequestData.endDate,
        reason: leaveRequestData.reason,
      },
    });
  }

  /**
   * Helper: Tạo alert khi có session request mới
   */
  async createSessionRequestAlert(sessionRequestData: any) {
    return this.createAlert({
      alertType: AlertType.SESSION_REQUEST,
      title: 'Yêu cầu buổi học mới',
      message: `Giáo viên ${sessionRequestData.teacherName} yêu cầu ${sessionRequestData.requestType} buổi học lớp ${sessionRequestData.className} vào ${sessionRequestData.sessionDate}`,
      severity: AlertSeverity.HIGH,
      payload: {
        sessionRequestId: sessionRequestData.id,
        teacherId: sessionRequestData.teacherId,
        classId: sessionRequestData.classId,
        requestType: sessionRequestData.requestType,
        sessionDate: sessionRequestData.sessionDate,
      },
    });
  }

  /**
   * Helper: Tạo alert khi có incident report mới
   */
  async createIncidentReportAlert(incidentData: any) {
    return this.createAlert({
      alertType: AlertType.INCIDENT_REPORT,
      title: 'Báo cáo sự cố mới',
      message: `Sự cố "${incidentData.incidentType}" được báo cáo bởi ${incidentData.reporterName}. Mức độ: ${incidentData.severity}`,
      severity: incidentData.severity === 'high' ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
      payload: {
        incidentReportId: incidentData.id,
        incidentType: incidentData.incidentType,
        reporterId: incidentData.reporterId,
        classId: incidentData.classId,
      },
    });
  }

  /**
   * Helper: Tạo alert khi có student class request mới
   */
  async createStudentClassRequestAlert(requestData: any) {
    return this.createAlert({
      alertType: AlertType.STUDENT_CLASS_REQUEST,
      title: 'Yêu cầu tham gia lớp học mới',
      message: `Phụ huynh đăng ký lớp ${requestData.className} (${requestData.subjectName}) cho học sinh ${requestData.studentName}`,
      severity: AlertSeverity.MEDIUM,
      payload: {
        requestId: requestData.id,
        studentId: requestData.studentId,
        studentName: requestData.studentName,
        classId: requestData.classId,
        className: requestData.className,
        subjectName: requestData.subjectName,
        teacherId: requestData.teacherId,
        teacherName: requestData.teacherName,
      },
    });
  }
}

