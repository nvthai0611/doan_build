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
exports.ScheduleConflictService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ScheduleConflictService = class ScheduleConflictService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRoomConflicts(query = {}) {
        try {
            const startDate = query.startDate
                ? new Date(query.startDate)
                : new Date();
            const endDate = query.endDate
                ? new Date(query.endDate)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const where = {
                sessionDate: {
                    gte: startDate,
                    lte: endDate,
                },
                roomId: {
                    not: null,
                },
                status: {
                    notIn: ['cancelled', 'day_off'],
                },
                class: {
                    status: {
                        in: ['active', 'suspended'],
                    },
                },
            };
            if (query.roomId) {
                where.roomId = query.roomId;
            }
            const sessions = await this.prisma.classSession.findMany({
                where,
                include: {
                    class: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    room: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                },
                            },
                        },
                    },
                    substituteTeacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                },
                            },
                        },
                    },
                },
                orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            });
            const conflictGroups = [];
            const processedIds = new Set();
            for (let i = 0; i < sessions.length; i++) {
                if (processedIds.has(sessions[i].id))
                    continue;
                const currentSession = sessions[i];
                const conflicts = [currentSession];
                for (let j = i + 1; j < sessions.length; j++) {
                    if (processedIds.has(sessions[j].id))
                        continue;
                    const otherSession = sessions[j];
                    if (currentSession.roomId === otherSession.roomId &&
                        currentSession.sessionDate.getTime() ===
                            otherSession.sessionDate.getTime()) {
                        if (this.isTimeOverlap(currentSession.startTime, currentSession.endTime, otherSession.startTime, otherSession.endTime)) {
                            conflicts.push(otherSession);
                            processedIds.add(otherSession.id);
                        }
                    }
                }
                if (conflicts.length > 1) {
                    processedIds.add(currentSession.id);
                    conflictGroups.push({
                        roomId: currentSession.roomId,
                        roomName: currentSession.room?.name || 'N/A',
                        date: currentSession.sessionDate,
                        startTime: currentSession.startTime,
                        endTime: currentSession.endTime,
                        conflictCount: conflicts.length,
                        sessions: conflicts.map((s) => ({
                            id: s.id,
                            classId: s.classId,
                            className: s.class?.name || 'N/A',
                            classCode: s.class?.code || 'N/A',
                            teacherId: s.substituteTeacherId || s.teacherId,
                            teacherName: s.substituteTeacher?.user?.fullName ||
                                s.teacher?.user?.fullName ||
                                'N/A',
                            isSubstitute: !!s.substituteTeacherId,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            status: s.status,
                        })),
                    });
                }
            }
            return {
                success: true,
                message: `Tìm thấy ${conflictGroups.length} nhóm conflict`,
                data: conflictGroups,
                meta: {
                    startDate,
                    endDate,
                    totalConflicts: conflictGroups.length,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách conflicts',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTeacherAvailableSlots(teacherId, query = {}) {
        try {
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
                include: {
                    user: {
                        select: {
                            fullName: true,
                        },
                    },
                },
            });
            if (!teacher) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy giáo viên',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const startDate = query.startDate
                ? new Date(query.startDate)
                : new Date();
            const endDate = query.endDate
                ? new Date(query.endDate)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const busySessions = await this.prisma.classSession.findMany({
                where: {
                    sessionDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                    OR: [{ teacherId }, { substituteTeacherId: teacherId }],
                    status: {
                        notIn: ['cancelled'],
                    },
                },
                select: {
                    sessionDate: true,
                    startTime: true,
                    endTime: true,
                    classId: true,
                    class: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            });
            const busySlotsByDate = {};
            busySessions.forEach((session) => {
                const dateKey = session.sessionDate.toISOString().split('T')[0];
                if (!busySlotsByDate[dateKey]) {
                    busySlotsByDate[dateKey] = [];
                }
                busySlotsByDate[dateKey].push({
                    startTime: session.startTime,
                    endTime: session.endTime,
                    className: session.class?.name || 'N/A',
                });
            });
            return {
                success: true,
                message: 'Lấy lịch giáo viên thành công',
                data: {
                    teacherId,
                    teacherName: teacher.user?.fullName || 'N/A',
                    busySlots: busySlotsByDate,
                },
                meta: {
                    startDate,
                    endDate,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy lịch giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addSession(body) {
        try {
            if (!body.classId ||
                !body.sessionDate ||
                !body.startTime ||
                !body.endTime) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'classId, sessionDate, startTime, endTime là bắt buộc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (body.startTime >= body.endTime) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Giờ kết thúc phải sau giờ bắt đầu',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classInfo = await this.prisma.class.findUnique({
                where: { id: body.classId },
                select: {
                    id: true,
                    name: true,
                    teacherId: true,
                    roomId: true,
                    academicYear: true,
                },
            });
            if (!classInfo) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const teacherId = body.teacherId || classInfo.teacherId;
            const roomId = body.roomId || classInfo.roomId;
            if (!teacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Lớp chưa có giáo viên, vui lòng chỉ định teacherId',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const sessionDate = new Date(body.sessionDate);
            const conflicts = {
                teacher: [],
                room: [],
            };
            const teacherConflicts = await this.prisma.classSession.findMany({
                where: {
                    sessionDate,
                    OR: [{ teacherId }, { substituteTeacherId: teacherId }],
                    status: {
                        notIn: ['cancelled'],
                    },
                },
                include: {
                    class: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            teacherConflicts.forEach((session) => {
                if (this.isTimeOverlap(body.startTime, body.endTime, session.startTime, session.endTime)) {
                    conflicts.teacher.push({
                        className: session.class?.name || 'N/A',
                        startTime: session.startTime,
                        endTime: session.endTime,
                    });
                }
            });
            if (roomId) {
                const roomConflicts = await this.prisma.classSession.findMany({
                    where: {
                        sessionDate,
                        roomId,
                        status: {
                            notIn: ['cancelled'],
                        },
                    },
                    include: {
                        class: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
                roomConflicts.forEach((session) => {
                    if (this.isTimeOverlap(body.startTime, body.endTime, session.startTime, session.endTime)) {
                        conflicts.room.push({
                            className: session.class?.name || 'N/A',
                            startTime: session.startTime,
                            endTime: session.endTime,
                        });
                    }
                });
            }
            if (conflicts.teacher.length > 0 || conflicts.room.length > 0) {
                return {
                    success: false,
                    message: 'Có xung đột lịch học',
                    conflicts,
                };
            }
            let suggestedRoomId = roomId;
            if (!suggestedRoomId) {
                const availableRooms = await this.prisma.room.findMany({
                    where: {
                        isActive: true,
                    },
                });
                for (const room of availableRooms) {
                    const roomBusy = await this.prisma.classSession.findFirst({
                        where: {
                            sessionDate,
                            roomId: room.id,
                            status: {
                                notIn: ['cancelled'],
                            },
                        },
                    });
                    const hasConflict = roomBusy &&
                        this.isTimeOverlap(body.startTime, body.endTime, roomBusy.startTime, roomBusy.endTime);
                    if (!hasConflict) {
                        suggestedRoomId = room.id;
                        break;
                    }
                }
            }
            const newSession = await this.prisma.classSession.create({
                data: {
                    classId: body.classId,
                    sessionDate,
                    startTime: body.startTime,
                    endTime: body.endTime,
                    teacherId: teacherId,
                    roomId: suggestedRoomId,
                    notes: body.notes || null,
                    status: 'has_not_happened',
                    academicYear: classInfo.academicYear,
                },
                include: {
                    class: {
                        select: {
                            name: true,
                        },
                    },
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                },
                            },
                        },
                    },
                    room: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            return {
                success: true,
                message: 'Thêm buổi học thành công',
                data: newSession,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi thêm buổi học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    isTimeOverlap(startA, endA, startB, endB) {
        return startA < endB && startB < endA;
    }
};
exports.ScheduleConflictService = ScheduleConflictService;
exports.ScheduleConflictService = ScheduleConflictService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleConflictService);
//# sourceMappingURL=schedule-conflict.service.js.map