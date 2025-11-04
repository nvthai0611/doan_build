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
exports.ScheduleChangeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ScheduleChangeService = class ScheduleChangeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createScheduleChange(createDto, teacherId) {
        const classData = await this.prisma.class.findFirst({
            where: {
                id: createDto.classId.toString(),
                teacherId: teacherId,
            },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Lớp học không tồn tại hoặc bạn không có quyền truy cập');
        }
        const session = await this.prisma.classSession.findFirst({
            where: {
                id: createDto.sessionId.toString(),
                classId: createDto.classId.toString(),
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Buổi học không tồn tại');
        }
        if (createDto.changeType === 'reschedule' && createDto.newDate && createDto.newStartTime) {
            const conflictCheck = await this.checkScheduleConflict(createDto.newDate, createDto.newStartTime, createDto.newEndTime || session.endTime, createDto.newRoomId?.toString(), teacherId);
            if (conflictCheck.hasConflict) {
                throw new common_1.BadRequestException(conflictCheck.message);
            }
        }
        const scheduleChange = await this.prisma.scheduleChange.create({
            data: {
                classId: createDto.classId.toString(),
                originalDate: session.sessionDate,
                originalTime: session.startTime,
                newDate: createDto.newDate ? new Date(createDto.newDate) : session.sessionDate,
                newTime: createDto.newStartTime || session.startTime,
                newRoomId: createDto.newRoomId?.toString(),
                reason: createDto.reason,
                status: 'pending',
                requestedBy: teacherId,
            },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                newRoom: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                    },
                },
            },
        });
        return this.mapToResponseDto(scheduleChange, classData.teacher);
    }
    async getMyScheduleChanges(teacherId, filters) {
        const { page = 1, limit = 10, status, changeType, classId } = filters;
        const skip = (page - 1) * limit;
        const where = {
            requestedBy: teacherId,
        };
        if (status) {
            where.status = status;
        }
        if (classId) {
            where.classId = classId.toString();
        }
        const [scheduleChanges, total] = await Promise.all([
            this.prisma.scheduleChange.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    requestedAt: 'desc',
                },
                include: {
                    class: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    newRoom: {
                        select: {
                            id: true,
                            name: true,
                            capacity: true,
                        },
                    },
                },
            }),
            this.prisma.scheduleChange.count({ where }),
        ]);
        const teacher = await this.prisma.teacher.findFirst({
            where: { id: teacherId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        const data = scheduleChanges.map((sc) => this.mapToResponseDto(sc, teacher));
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getScheduleChangeDetail(id, teacherId) {
        const scheduleChange = await this.prisma.scheduleChange.findFirst({
            where: {
                id,
                requestedBy: teacherId,
            },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                newRoom: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                    },
                },
            },
        });
        if (!scheduleChange) {
            throw new common_1.NotFoundException('Yêu cầu dời lịch không tồn tại');
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        return this.mapToResponseDto(scheduleChange, teacher);
    }
    async cancelScheduleChange(id, teacherId) {
        const scheduleChange = await this.prisma.scheduleChange.findFirst({
            where: {
                id,
                requestedBy: teacherId,
                status: 'pending',
            },
        });
        if (!scheduleChange) {
            throw new common_1.NotFoundException('Yêu cầu dời lịch không tồn tại hoặc không thể hủy');
        }
        await this.prisma.scheduleChange.update({
            where: { id },
            data: { status: 'cancelled' },
        });
    }
    async checkScheduleConflict(newDate, newStartTime, newEndTime, newRoomId, teacherId) {
        if (newRoomId) {
            const roomConflict = await this.prisma.classSession.findFirst({
                where: {
                    roomId: newRoomId,
                    sessionDate: new Date(newDate),
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
                        teacherId: teacherId,
                    },
                    sessionDate: new Date(newDate),
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
                    message: 'Bạn đã có lớp học khác trong khoảng thời gian này',
                };
            }
        }
        return { hasConflict: false, message: '' };
    }
    mapToResponseDto(scheduleChange, teacher) {
        return {
            id: parseInt(scheduleChange.id),
            classId: parseInt(scheduleChange.classId),
            class: {
                id: parseInt(scheduleChange.class.id),
                name: scheduleChange.class.name,
                description: scheduleChange.class.description,
            },
            sessionId: 0,
            session: {
                id: 0,
                sessionDate: scheduleChange.originalDate,
                startTime: scheduleChange.originalTime,
                endTime: scheduleChange.newTime,
            },
            changeType: 'reschedule',
            newDate: scheduleChange.newDate,
            newStartTime: scheduleChange.newTime,
            newEndTime: scheduleChange.newTime,
            newRoomId: scheduleChange.newRoomId ? parseInt(scheduleChange.newRoomId) : undefined,
            newRoom: scheduleChange.newRoom ? {
                id: parseInt(scheduleChange.newRoom.id),
                name: scheduleChange.newRoom.name,
                capacity: scheduleChange.newRoom.capacity,
            } : undefined,
            reason: scheduleChange.reason,
            notes: undefined,
            status: scheduleChange.status,
            teacherId: parseInt(teacher.id),
            teacher: {
                id: parseInt(teacher.id),
                userId: teacher.userId,
                user: teacher.user,
            },
            createdBy: parseInt(teacher.id),
            approvedBy: undefined,
            approvedAt: scheduleChange.processedAt,
            createdAt: scheduleChange.requestedAt,
            updatedAt: scheduleChange.requestedAt,
        };
    }
};
exports.ScheduleChangeService = ScheduleChangeService;
exports.ScheduleChangeService = ScheduleChangeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleChangeService);
//# sourceMappingURL=schedule-change.service.js.map