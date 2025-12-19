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
exports.ScheduleChangeAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ScheduleChangeAdminService = class ScheduleChangeAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getScheduleChanges(query) {
        const { page = 1, limit = 10, status, classId, teacherId, } = query.params;
        const where = {};
        if (status)
            where.status = status;
        if (classId)
            where.classId = classId;
        if (teacherId)
            where.requestedBy = teacherId;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.scheduleChange.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { requestedAt: 'desc' },
                include: {
                    class: {
                        select: {
                            id: true,
                            name: true,
                            subject: { select: { name: true } },
                            teacher: {
                                include: {
                                    user: { select: { fullName: true, email: true } },
                                },
                            },
                        },
                    },
                    newRoom: { select: { id: true, name: true, capacity: true } },
                },
            }),
            this.prisma.scheduleChange.count({ where }),
        ]);
        return {
            success: true,
            data,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getScheduleChangeById(id) {
        const sc = await this.prisma.scheduleChange.findUnique({
            where: { id },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        subject: { select: { name: true } },
                        teacher: {
                            include: {
                                user: { select: { fullName: true, email: true } },
                            },
                        },
                    },
                },
                newRoom: { select: { id: true, name: true, capacity: true } },
            },
        });
        if (!sc) {
            throw new common_1.NotFoundException('Không tìm thấy yêu cầu dời lịch');
        }
        return sc;
    }
    async handleScheduleChange(id, action, notes) {
        if (!['approve', 'reject'].includes(action)) {
            throw new common_1.BadRequestException('Hành động không hợp lệ');
        }
        const sc = await this.prisma.scheduleChange.findUnique({
            where: { id },
            include: {
                class: {
                    select: {
                        id: true,
                        teacherId: true,
                    },
                },
            },
        });
        if (!sc)
            throw new common_1.NotFoundException('Không tìm thấy yêu cầu dời lịch');
        if (sc.status !== 'pending') {
            throw new common_1.BadRequestException('Yêu cầu đã được xử lý');
        }
        if (action === 'approve') {
            const [newStartTimeRaw, newEndTimeRaw] = (sc.newTime || '').split('-');
            const newStartTime = (newStartTimeRaw || '').trim();
            const newEndTime = (newEndTimeRaw || newStartTimeRaw || '').trim();
            if (!newStartTime || !newEndTime) {
                throw new common_1.BadRequestException('Thiếu thông tin giờ bắt đầu/kết thúc mới');
            }
            const conflict = await this.checkScheduleConflict(sc.newDate, newStartTime, newEndTime, sc.newRoomId || undefined, sc.class?.teacherId || undefined);
            if (conflict.hasConflict) {
                throw new common_1.BadRequestException(conflict.message);
            }
        }
        const updated = await this.prisma.scheduleChange.update({
            where: { id },
            data: {
                status: action === 'approve' ? 'approved' : 'rejected',
                processedAt: new Date(),
            },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        subject: { select: { name: true } },
                        teacher: {
                            include: {
                                user: { select: { fullName: true, email: true } },
                            },
                        },
                    },
                },
                newRoom: { select: { id: true, name: true, capacity: true } },
            },
        });
        return updated;
    }
    async checkScheduleConflict(newDate, newStartTime, newEndTime, newRoomId, teacherId) {
        const sessionDate = newDate;
        if (newRoomId) {
            const roomConflict = await this.prisma.classSession.findFirst({
                where: {
                    roomId: newRoomId,
                    sessionDate,
                    status: { notIn: ['cancelled', 'end'] },
                    OR: [
                        {
                            AND: [
                                { startTime: { lte: newStartTime } },
                                { endTime: { gt: newStartTime } },
                            ],
                        },
                        {
                            AND: [
                                { startTime: { lt: newEndTime } },
                                { endTime: { gte: newEndTime } },
                            ],
                        },
                        {
                            AND: [
                                { startTime: { gte: newStartTime } },
                                { endTime: { lte: newEndTime } },
                            ],
                        },
                    ],
                },
            });
            if (roomConflict) {
                return {
                    hasConflict: true,
                    message: 'Phòng học đã được sử dụng trong khoảng thời gian này',
                };
            }
        }
        if (teacherId) {
            const teacherConflict = await this.prisma.classSession.findFirst({
                where: {
                    class: {
                        teacherId,
                    },
                    sessionDate,
                    status: { notIn: ['cancelled', 'end'] },
                    OR: [
                        {
                            AND: [
                                { startTime: { lte: newStartTime } },
                                { endTime: { gt: newStartTime } },
                            ],
                        },
                        {
                            AND: [
                                { startTime: { lt: newEndTime } },
                                { endTime: { gte: newEndTime } },
                            ],
                        },
                        {
                            AND: [
                                { startTime: { gte: newStartTime } },
                                { endTime: { lte: newEndTime } },
                            ],
                        },
                    ],
                },
            });
            if (teacherConflict) {
                return {
                    hasConflict: true,
                    message: 'Giáo viên đã có buổi dạy khác trong khoảng thời gian này',
                };
            }
        }
        return { hasConflict: false, message: '' };
    }
};
exports.ScheduleChangeAdminService = ScheduleChangeAdminService;
exports.ScheduleChangeAdminService = ScheduleChangeAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleChangeAdminService);
//# sourceMappingURL=schedule-change.service.js.map