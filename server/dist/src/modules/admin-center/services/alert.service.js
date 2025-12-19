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
exports.AlertService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const alert_dto_1 = require("../dto/alert.dto");
let AlertService = class AlertService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAlert(createAlertDto) {
        try {
            const alert = await this.prisma.alert.create({
                data: {
                    alertType: createAlertDto.alertType,
                    title: createAlertDto.title,
                    message: createAlertDto.message,
                    severity: createAlertDto.severity || alert_dto_1.AlertSeverity.MEDIUM,
                    payload: createAlertDto.payload || null,
                    isRead: false,
                    processed: false,
                },
            });
            return {
                data: alert,
                message: 'Tạo cảnh báo thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi tạo cảnh báo',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAlerts(params, userId, userRole) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
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
            let total = await this.prisma.alert.count({ where });
            let alerts = await this.prisma.alert.findMany({
                where,
                orderBy: [
                    { processed: 'asc' },
                    { isRead: 'asc' },
                    { triggeredAt: 'desc' },
                    { severity: 'asc' },
                ],
                skip,
                take: limit,
            });
            const filterUserId = params.userId || userId;
            const filterRole = params.role || userRole;
            if (filterUserId || filterRole) {
                alerts = alerts.filter((alert) => {
                    const payload = alert.payload || {};
                    if (filterUserId && payload.targetUserId && payload.targetUserId !== filterUserId) {
                        return false;
                    }
                    if (filterRole && payload.targetRole && payload.targetRole !== filterRole) {
                        return false;
                    }
                    if (filterRole && !payload.targetRole && !['center_owner', 'admin'].includes(filterRole)) {
                        return false;
                    }
                    return true;
                });
                total = alerts.length;
            }
            let unreadCount = await this.prisma.alert.count({
                where: { ...where, isRead: false },
            });
            if (filterUserId || filterRole) {
                const allUnreadAlerts = await this.prisma.alert.findMany({
                    where: { ...where, isRead: false },
                });
                unreadCount = allUnreadAlerts.filter((alert) => {
                    const payload = alert.payload || {};
                    if (filterUserId && payload.targetUserId && payload.targetUserId !== filterUserId) {
                        return false;
                    }
                    if (filterRole && payload.targetRole && payload.targetRole !== filterRole) {
                        return false;
                    }
                    if (filterRole && !payload.targetRole && !['center_owner', 'admin'].includes(filterRole)) {
                        return false;
                    }
                    return true;
                }).length;
            }
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
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách cảnh báo',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUnreadCount(userId, userRole) {
        try {
            let alerts = await this.prisma.alert.findMany({
                where: { isRead: false },
            });
            if (userId || userRole) {
                alerts = alerts.filter((alert) => {
                    const payload = alert.payload || {};
                    if (userId && payload.targetUserId && payload.targetUserId !== userId) {
                        return false;
                    }
                    if (userRole && payload.targetRole && payload.targetRole !== userRole) {
                        return false;
                    }
                    if (userRole && !payload.targetRole && !['center_owner', 'admin'].includes(userRole)) {
                        return false;
                    }
                    return true;
                });
            }
            return {
                data: { count: alerts.length },
                message: 'Lấy số lượng cảnh báo chưa đọc thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy số lượng cảnh báo',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateAlert(id, updateAlertDto) {
        try {
            const alert = await this.prisma.alert.findUnique({
                where: { id: BigInt(id) },
            });
            if (!alert) {
                throw new common_1.NotFoundException('Không tìm thấy cảnh báo');
            }
            const data = {};
            if (updateAlertDto.isRead !== undefined) {
                data.isRead = updateAlertDto.isRead;
            }
            if (updateAlertDto.processed !== undefined) {
                data.processed = updateAlertDto.processed;
                if (updateAlertDto.processed) {
                    data.processedAt = new Date();
                }
            }
            const updatedAlert = await this.prisma.alert.update({
                where: { id: BigInt(id) },
                data,
            });
            return {
                data: updatedAlert,
                message: 'Cập nhật cảnh báo thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật cảnh báo',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
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
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi đánh dấu đã đọc',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteAlert(id) {
        try {
            const alert = await this.prisma.alert.findUnique({
                where: { id: BigInt(id) },
            });
            if (!alert) {
                throw new common_1.NotFoundException('Không tìm thấy cảnh báo');
            }
            await this.prisma.alert.delete({
                where: { id: BigInt(id) },
            });
            return {
                message: 'Xóa cảnh báo thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xóa cảnh báo',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createParentRegistrationAlert(parentData) {
        return this.createAlert({
            alertType: alert_dto_1.AlertType.PARENT_REGISTRATION,
            title: 'Phụ huynh mới đăng ký',
            message: `Phụ huynh ${parentData.fullName} (${parentData.email}) vừa đăng ký tài khoản với ${parentData.childrenCount} con.`,
            severity: alert_dto_1.AlertSeverity.HIGH,
            payload: {
                parentId: parentData.id,
                email: parentData.email,
                phone: parentData.phone,
                childrenCount: parentData.childrenCount,
            },
        });
    }
    async createLeaveRequestAlert(leaveRequestData) {
        return this.createAlert({
            alertType: alert_dto_1.AlertType.LEAVE_REQUEST,
            title: 'Đơn xin nghỉ mới',
            message: `${leaveRequestData.requesterType} ${leaveRequestData.requesterName} xin nghỉ từ ${leaveRequestData.startDate} đến ${leaveRequestData.endDate}. Lý do: ${leaveRequestData.reason}`,
            severity: alert_dto_1.AlertSeverity.HIGH,
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
    async createSessionRequestAlert(sessionRequestData) {
        return this.createAlert({
            alertType: alert_dto_1.AlertType.SESSION_REQUEST,
            title: 'Yêu cầu buổi học mới',
            message: `Giáo viên ${sessionRequestData.teacherName} yêu cầu ${sessionRequestData.requestType} buổi học lớp ${sessionRequestData.className} vào ${sessionRequestData.sessionDate}`,
            severity: alert_dto_1.AlertSeverity.HIGH,
            payload: {
                sessionRequestId: sessionRequestData.id,
                teacherId: sessionRequestData.teacherId,
                classId: sessionRequestData.classId,
                requestType: sessionRequestData.requestType,
                sessionDate: sessionRequestData.sessionDate,
            },
        });
    }
    async createIncidentReportAlert(incidentData) {
        return this.createAlert({
            alertType: alert_dto_1.AlertType.INCIDENT_REPORT,
            title: 'Báo cáo sự cố mới',
            message: `Sự cố "${incidentData.incidentType}" được báo cáo bởi ${incidentData.reporterName}. Mức độ: ${incidentData.severity}`,
            severity: alert_dto_1.AlertSeverity.HIGH,
            payload: {
                incidentReportId: incidentData.id,
                incidentType: incidentData.incidentType,
                reporterId: incidentData.reporterId,
                classId: incidentData.classId,
            },
        });
    }
    async createStudentClassRequestAlert(requestData) {
        return this.createAlert({
            alertType: alert_dto_1.AlertType.STUDENT_CLASS_REQUEST,
            title: 'Yêu cầu tham gia lớp học mới',
            message: `Phụ huynh đăng ký lớp ${requestData.className} (${requestData.subjectName}) cho học sinh ${requestData.studentName}`,
            severity: alert_dto_1.AlertSeverity.MEDIUM,
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
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertService);
//# sourceMappingURL=alert.service.js.map