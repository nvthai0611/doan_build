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
var ClassNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassNotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const alert_service_1 = require("./alert.service");
const alert_dto_1 = require("../dto/alert.dto");
const email_notification_service_1 = require("../../shared/services/email-notification.service");
let ClassNotificationService = ClassNotificationService_1 = class ClassNotificationService {
    constructor(prisma, alertService, emailNotificationService) {
        this.prisma = prisma;
        this.alertService = alertService;
        this.emailNotificationService = emailNotificationService;
        this.logger = new common_1.Logger(ClassNotificationService_1.name);
    }
    async checkClassesStartingSoon() {
        this.logger.log('🔍 Đang kiểm tra các lớp sắp bắt đầu...');
        try {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const notificationDays = [3];
            for (const daysBefore of notificationDays) {
                const targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() + daysBefore);
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
                this.logger.log(`📅 Tìm thấy ${classes.length} lớp sẽ bắt đầu sau ${daysBefore} ngày`);
                for (const classItem of classes) {
                    await this.createClassStartingAlert(classItem, daysBefore);
                }
            }
            this.logger.log('✅ Hoàn thành kiểm tra lớp sắp bắt đầu');
        }
        catch (error) {
            this.logger.error('❌ Lỗi khi kiểm tra lớp sắp bắt đầu:', error);
            throw error;
        }
    }
    async checkClassesEndingSoon() {
        this.logger.log('🔍 Đang kiểm tra các lớp sắp kết thúc...');
        try {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const notificationDays = [30, 14, 3];
            for (const daysBefore of notificationDays) {
                const targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() + daysBefore);
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
                this.logger.log(`📅 Tìm thấy ${classes.length} lớp sẽ kết thúc sau ${daysBefore} ngày`);
                for (const classItem of classes) {
                    await this.createClassEndingAlert(classItem, daysBefore);
                }
            }
            this.logger.log('✅ Hoàn thành kiểm tra lớp sắp kết thúc');
        }
        catch (error) {
            this.logger.error('❌ Lỗi khi kiểm tra lớp sắp kết thúc:', error);
            throw error;
        }
    }
    async createClassStartingAlert(classItem, daysRemaining) {
        try {
            const existingAlerts = await this.prisma.alert.findMany({
                where: {
                    alertType: 'class_starting_soon',
                    message: {
                        contains: `${daysRemaining} ngày`,
                    },
                },
                take: 10,
            });
            const existingAlert = existingAlerts.find((alert) => {
                const payload = alert.payload;
                return payload && payload.classId === classItem.id && payload.daysRemaining === daysRemaining;
            });
            if (existingAlert) {
                this.logger.log(`⚠️ Alert đã tồn tại cho lớp ${classItem.name} (${daysRemaining} ngày)`);
                return;
            }
            let severity = alert_dto_1.AlertSeverity.MEDIUM;
            if (daysRemaining <= 3) {
                severity = alert_dto_1.AlertSeverity.HIGH;
            }
            const startDate = classItem.actualStartDate || classItem.expectedStartDate;
            const startDateStr = startDate
                ? new Date(startDate).toLocaleDateString('vi-VN')
                : 'Chưa xác định';
            const scheduleText = this.formatSchedule(classItem.recurringSchedule);
            const title = `Lớp "${classItem.name}" sẽ bắt đầu sau ${daysRemaining} ngày`;
            const message = this.buildStartingMessage(classItem, daysRemaining, startDateStr, scheduleText);
            const payload = {
                classId: classItem.id,
                className: classItem.name,
                classCode: classItem.classCode,
                daysRemaining,
                startDate: startDate ? startDate.toISOString() : null,
                notificationType: 'class_starting',
            };
            await this.alertService.createAlert({
                alertType: 'class_starting_soon',
                title,
                message,
                severity,
                payload,
            });
            await this.sendClassStartingEmail(classItem, daysRemaining, startDateStr, scheduleText);
            this.logger.log(`✅ Đã tạo alert cho lớp ${classItem.name} (${daysRemaining} ngày)`);
        }
        catch (error) {
            this.logger.error(`❌ Lỗi khi tạo alert cho lớp ${classItem.name}:`, error);
        }
    }
    async createClassEndingAlert(classItem, daysRemaining) {
        try {
            const existingAlerts = await this.prisma.alert.findMany({
                where: {
                    alertType: 'class_ending_soon',
                    message: {
                        contains: `${daysRemaining} ngày`,
                    },
                },
                take: 10,
            });
            const existingAlert = existingAlerts.find((alert) => {
                const payload = alert.payload;
                return payload && payload.classId === classItem.id && payload.daysRemaining === daysRemaining;
            });
            if (existingAlert) {
                this.logger.log(`⚠️ Alert đã tồn tại cho lớp ${classItem.name} (${daysRemaining} ngày)`);
                return;
            }
            let severity = alert_dto_1.AlertSeverity.MEDIUM;
            if (daysRemaining <= 7) {
                severity = alert_dto_1.AlertSeverity.HIGH;
            }
            const endDateStr = classItem.actualEndDate
                ? new Date(classItem.actualEndDate).toLocaleDateString('vi-VN')
                : 'Chưa xác định';
            const scheduleText = this.formatSchedule(classItem.recurringSchedule);
            const title = `Lớp "${classItem.name}" sẽ kết thúc sau ${daysRemaining} ngày`;
            const message = this.buildEndingMessage(classItem, daysRemaining, endDateStr, scheduleText);
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
            await this.alertService.createAlert({
                alertType: 'class_ending_soon',
                title,
                message,
                severity,
                payload,
            });
            await this.sendClassEndingEmail(classItem, daysRemaining, endDateStr, scheduleText);
            this.logger.log(`✅ Đã tạo alert cho lớp ${classItem.name} (${daysRemaining} ngày)`);
        }
        catch (error) {
            this.logger.error(`❌ Lỗi khi tạo alert cho lớp ${classItem.name}:`, error);
        }
    }
    buildStartingMessage(classItem, daysRemaining, startDate, scheduleText) {
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
    buildEndingMessage(classItem, daysRemaining, endDate, scheduleText) {
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
    formatSchedule(recurringSchedule) {
        if (!recurringSchedule || !recurringSchedule.schedules) {
            return '';
        }
        const dayNames = {
            monday: 'Thứ 2',
            tuesday: 'Thứ 3',
            wednesday: 'Thứ 4',
            thursday: 'Thứ 5',
            friday: 'Thứ 6',
            saturday: 'Thứ 7',
            sunday: 'Chủ nhật',
        };
        return recurringSchedule.schedules
            .map((schedule) => {
            const dayName = dayNames[schedule.day] || schedule.day;
            return `${dayName}: ${schedule.startTime} - ${schedule.endTime}`;
        })
            .join(', ');
    }
    async sendClassStartingEmail(classItem, daysRemaining, startDate, scheduleText) {
        try {
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
            for (const owner of centerOwners) {
                await this.emailNotificationService.sendClassStartingNotificationEmail(owner.email, {
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
                });
            }
            this.logger.log(`📧 Đã gửi email thông báo cho ${centerOwners.length} center owner(s)`);
        }
        catch (error) {
            this.logger.error('❌ Lỗi khi gửi email thông báo:', error);
        }
    }
    async sendClassEndingEmail(classItem, daysRemaining, endDate, scheduleText) {
        try {
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
            for (const owner of centerOwners) {
                await this.emailNotificationService.sendClassEndingNotificationEmail(owner.email, {
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
                });
            }
            this.logger.log(`📧 Đã gửi email thông báo cho ${centerOwners.length} center owner(s)`);
        }
        catch (error) {
            this.logger.error('❌ Lỗi khi gửi email thông báo:', error);
        }
    }
};
exports.ClassNotificationService = ClassNotificationService;
exports.ClassNotificationService = ClassNotificationService = ClassNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alert_service_1.AlertService,
        email_notification_service_1.EmailNotificationService])
], ClassNotificationService);
//# sourceMappingURL=class-notification.service.js.map