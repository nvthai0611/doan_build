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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ScheduleService = class ScheduleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatDateYYYYMMDD(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    async getWeeklySchedule(teacherId, weekStart) {
        try {
            const startDate = new Date(weekStart);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            const schedules = await this.prisma.classSession.findMany({
                where: {
                    sessionDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    teacherId: teacherId
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } }
                        }
                    },
                    room: { select: { name: true } }
                },
                orderBy: [
                    { sessionDate: 'asc' },
                    { startTime: 'asc' }
                ]
            });
            return schedules.map(session => ({
                id: session.id,
                date: this.formatDateYYYYMMDD(session.sessionDate),
                startTime: session.startTime,
                endTime: session.endTime,
                subject: session.class.subject.name,
                className: session.class.name,
                room: session.room?.name || 'Chưa xác định',
                studentCount: session.class.maxStudents || 0,
                status: session.status,
                notes: session.notes,
                type: 'regular',
                teacherId: session.teacherId,
                academicYear: session.academicYear,
                createdAt: session.createdAt,
                updatedAt: session.createdAt
            }));
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy lịch dạy theo tuần: ${error.message}`);
        }
    }
    async getMonthlySchedule(teacherId, year, month) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);
            const schedules = await this.prisma.classSession.findMany({
                where: {
                    sessionDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    teacherId: teacherId
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } },
                        },
                    },
                    room: { select: { name: true } },
                },
                orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            });
            return schedules.map((session) => ({
                id: session.id,
                date: this.formatDateYYYYMMDD(session.sessionDate),
                startTime: session.startTime,
                endTime: session.endTime,
                subject: session.class.subject.name,
                className: session.class.name,
                room: session.room?.name || 'Chưa xác định',
                studentCount: session.class.maxStudents || 0,
                status: session.status,
                notes: session.notes,
                type: 'regular',
                teacherId: session.teacherId,
                academicYear: session.academicYear,
                createdAt: session.createdAt,
                updatedAt: session.createdAt,
            }));
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy lịch dạy theo tháng: ${error.message}`);
        }
    }
    async getScheduleDetail(teacherId, scheduleId) {
        try {
            const session = await this.prisma.classSession.findFirst({
                where: {
                    id: scheduleId,
                    teacherId: teacherId
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } }
                        }
                    },
                    room: { select: { name: true } }
                }
            });
            if (!session) {
                return null;
            }
            return {
                id: session.id,
                date: this.formatDateYYYYMMDD(session.sessionDate),
                startTime: session.startTime,
                endTime: session.endTime,
                subject: session.class.subject.name,
                className: session.class.name,
                room: session.room?.name || 'Chưa xác định',
                studentCount: session.class.maxStudents || 0,
                status: session.status,
                notes: session.notes,
                type: 'regular',
                teacherId: session.teacherId,
                academicYear: session.academicYear,
                createdAt: session.createdAt,
                updatedAt: session.createdAt
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy chi tiết buổi dạy: ${error.message}`);
        }
    }
    async updateScheduleStatus(teacherId, scheduleId, updateStatusDto) {
        try {
            const existingSession = await this.prisma.classSession.findFirst({
                where: {
                    id: scheduleId,
                    teacherId: teacherId
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } }
                        }
                    },
                    room: { select: { name: true } }
                }
            });
            if (!existingSession) {
                return null;
            }
            const updatedSession = await this.prisma.classSession.update({
                where: { id: scheduleId },
                data: {
                    status: updateStatusDto.status,
                    notes: updateStatusDto.notes || existingSession.notes
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } }
                        }
                    },
                    room: { select: { name: true } }
                }
            });
            return {
                id: updatedSession.id,
                date: this.formatDateYYYYMMDD(updatedSession.sessionDate),
                startTime: updatedSession.startTime,
                endTime: updatedSession.endTime,
                subject: updatedSession.class.subject.name,
                className: updatedSession.class.name,
                room: updatedSession.room?.name || 'Chưa xác định',
                studentCount: updatedSession.class.maxStudents || 0,
                status: updatedSession.status,
                notes: updatedSession.notes,
                type: 'regular',
                teacherId: updatedSession.teacherId,
                academicYear: updatedSession.academicYear,
                createdAt: updatedSession.createdAt,
                updatedAt: updatedSession.createdAt
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi cập nhật trạng thái buổi dạy: ${error.message}`);
        }
    }
    async exportScheduleToExcel(teacherId, filters) {
        try {
            throw new Error('Excel export chưa được implement. Cần cài đặt exceljs package.');
        }
        catch (error) {
            throw new Error(`Lỗi khi xuất Excel: ${error.message}`);
        }
    }
    getTypeText(type) {
        switch (type) {
            case 'regular': return 'Thường';
            case 'exam': return 'Thi';
            case 'makeup': return 'Học bù';
            default: return type;
        }
    }
    getStatusText(status) {
        switch (status) {
            case 'happening': return 'Đang diễn ra';
            case 'completed': return 'Đã hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map