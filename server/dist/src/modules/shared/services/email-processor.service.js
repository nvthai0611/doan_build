"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const email_util_1 = require("../../../utils/email.util");
let EmailProcessor = class EmailProcessor {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleTeacherAssignmentEmail(job) {
        const { classId, teacherId } = job.data;
        try {
            console.log(`📧 Bắt đầu xử lý email job ${job.id} cho lớp ${classId} và giáo viên ${teacherId}`);
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
                throw new Error(`Không tìm thấy lớp học với ID: ${classId}`);
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
                throw new Error(`Không tìm thấy giáo viên với ID: ${teacherId}`);
            }
            if (!teacher.user?.email) {
                throw new Error(`Giáo viên ${teacher.user?.fullName} không có email`);
            }
            const formatSchedule = (schedule) => {
                console.log('🔍 Debug schedule data:', JSON.stringify(schedule, null, 2));
                console.log('🔍 Schedule type:', typeof schedule);
                let scheduleArray = schedule;
                if (typeof schedule === 'string') {
                    try {
                        scheduleArray = JSON.parse(schedule);
                        console.log('📝 Parsed JSON schedule:', scheduleArray);
                    }
                    catch (error) {
                        console.log('❌ Failed to parse JSON schedule:', error);
                        return 'Chưa có lịch học';
                    }
                }
                if (scheduleArray && typeof scheduleArray === 'object' && scheduleArray.schedules) {
                    scheduleArray = scheduleArray.schedules;
                    console.log('📋 Found schedules property:', scheduleArray);
                }
                if (!scheduleArray || !Array.isArray(scheduleArray)) {
                    console.log('❌ Schedule is not array or empty');
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
                const result = scheduleArray.map((item) => {
                    const dayKey = item.day || item.dayOfWeek;
                    const day = dayNames[dayKey] || dayKey;
                    const startTime = item.startTime || 'Chưa xác định';
                    const endTime = item.endTime || 'Chưa xác định';
                    return `${day}: ${startTime} - ${endTime}`;
                }).join('<br>');
                console.log('✅ Formatted schedule:', result);
                return result;
            };
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
            const emailSubject = `📚 Thông báo phân công lớp học: ${classData.name}`;
            const result = await (0, email_util_1.default)(teacher.user.email, emailSubject, emailHtml);
            console.log(`✅ Email đã được gửi thành công cho job ${job.id}`);
            console.log(`📧 Message ID: ${result.messageId}`);
            console.log(`👨‍🏫 Gửi đến: ${teacher.user.email}`);
            console.log(`📚 Lớp học: ${classData.name}`);
            job.progress(100);
            return {
                success: true,
                message: 'Email đã được gửi thành công',
                data: {
                    teacherEmail: teacher.user.email,
                    classId: classData.id,
                    className: classData.name,
                    messageId: result.messageId
                }
            };
        }
        catch (error) {
            console.error(`❌ Lỗi khi xử lý email job ${job.id}:`, error);
            job.progress(0);
            throw error;
        }
    }
    getStatusLabel(status) {
        const statusLabels = {
            'draft': 'Bản nháp',
            'ready': 'Sẵn sàng',
            'active': 'Đang hoạt động',
            'completed': 'Đã hoàn thành',
            'cancelled': 'Đã hủy',
            'suspended': 'Tạm dừng'
        };
        return statusLabels[status] || status;
    }
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bull_1.Process)('send-teacher-assignment-email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleTeacherAssignmentEmail", null);
exports.EmailProcessor = EmailProcessor = __decorate([
    (0, bull_1.Processor)('email'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailProcessor);
//# sourceMappingURL=email-processor.service.js.map