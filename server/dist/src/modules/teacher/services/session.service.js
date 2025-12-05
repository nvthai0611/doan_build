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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let SessionService = class SessionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatDateYYYYMMDD(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    async getSessionDetail(teacherId, sessionId) {
        try {
            const session = await this.prisma.classSession.findFirst({
                where: {
                    id: sessionId,
                    teacherId: teacherId
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } },
                            enrollments: {
                                include: {
                                    student: {
                                        include: {
                                            user: { select: { fullName: true, avatar: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    room: { select: { name: true } },
                    teacher: {
                        include: {
                            user: { select: { fullName: true } }
                        }
                    },
                    attendances: {
                        include: {
                            student: {
                                include: {
                                    user: { select: { fullName: true, avatar: true } }
                                }
                            }
                        }
                    }
                }
            });
            if (!session) {
                return null;
            }
            console.log(session);
            const students = session.class.enrollments.map(enrollment => {
                const attendance = session.attendances.find(att => att.studentId === enrollment.studentId);
                return {
                    id: enrollment.student.id,
                    name: enrollment.student.user.fullName || 'Chưa có tên',
                    avatar: enrollment.student.user.avatar || undefined,
                    attendanceStatus: attendance?.status || undefined
                };
            });
            return {
                id: session.id,
                date: this.formatDateYYYYMMDD(session.sessionDate),
                startTime: session.startTime,
                endTime: session.endTime,
                subject: session.class.subject.name,
                className: session.class.name,
                room: session.room?.name || 'Chưa xác định',
                studentCount: session.class.enrollments.length,
                status: session.status,
                notes: session.notes || undefined,
                type: 'regular',
                teacherId: session.teacherId,
                teacherName: session.teacher?.user.fullName || undefined,
                students,
                createdAt: session.createdAt,
                updatedAt: session.createdAt
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy chi tiết buổi học: ${error.message}`);
        }
    }
    async rescheduleSession(teacherId, sessionId, rescheduleDto) {
        try {
            const existingSession = await this.prisma.classSession.findFirst({
                where: {
                    id: sessionId,
                    teacherId: teacherId
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } },
                            enrollments: {
                                include: {
                                    student: {
                                        include: {
                                            user: { select: { fullName: true, avatar: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    room: { select: { name: true } },
                    teacher: {
                        include: {
                            user: { select: { fullName: true } }
                        }
                    },
                    attendances: {
                        include: {
                            student: {
                                include: {
                                    user: { select: { fullName: true, avatar: true } }
                                }
                            }
                        }
                    }
                }
            });
            if (!existingSession) {
                return null;
            }
            await this.validateScheduleConflict(rescheduleDto.newRoomId || existingSession.roomId, new Date(rescheduleDto.newDate), rescheduleDto.newStartTime, rescheduleDto.newEndTime, sessionId);
            const scheduleChange = await this.prisma.scheduleChange.create({
                data: {
                    classId: existingSession.classId,
                    originalDate: existingSession.sessionDate,
                    originalTime: `${existingSession.startTime}-${existingSession.endTime}`,
                    newDate: new Date(rescheduleDto.newDate),
                    newTime: `${rescheduleDto.newStartTime}-${rescheduleDto.newEndTime}`,
                    newRoomId: rescheduleDto.newRoomId || existingSession.roomId,
                    reason: rescheduleDto.reason,
                    status: 'pending',
                    requestedBy: teacherId
                }
            });
            const students = existingSession.class.enrollments.map(enrollment => {
                const attendance = existingSession.attendances.find(att => att.studentId === enrollment.studentId);
                return {
                    id: enrollment.student.id,
                    name: enrollment.student.user.fullName || 'Chưa có tên',
                    avatar: enrollment.student.user.avatar || undefined,
                    attendanceStatus: attendance?.status || undefined
                };
            });
            return {
                id: existingSession.id,
                date: this.formatDateYYYYMMDD(existingSession.sessionDate),
                startTime: existingSession.startTime,
                endTime: existingSession.endTime,
                subject: existingSession.class.subject.name,
                className: existingSession.class.name,
                room: existingSession.room?.name || 'Chưa xác định',
                studentCount: existingSession.class.enrollments.length,
                status: existingSession.status,
                notes: existingSession.notes || undefined,
                type: 'regular',
                teacherId: existingSession.teacherId,
                teacherName: existingSession.teacher?.user.fullName || undefined,
                students,
                createdAt: existingSession.createdAt,
                updatedAt: existingSession.createdAt
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi dời lịch buổi học: ${error.message}`);
        }
    }
    async validateScheduleConflict(roomId, newDate, newStartTime, newEndTime, excludeSessionId) {
        if (roomId) {
            const roomConflict = await this.prisma.classSession.findFirst({
                where: {
                    roomId: roomId,
                    sessionDate: newDate,
                    startTime: { lte: newEndTime },
                    endTime: { gte: newStartTime },
                    id: { not: excludeSessionId }
                }
            });
            if (roomConflict) {
                throw new Error('Phòng học đã được sử dụng trong khoảng thời gian này');
            }
        }
        const currentSession = await this.prisma.classSession.findUnique({
            where: { id: excludeSessionId },
            select: { teacherId: true }
        });
        if (currentSession?.teacherId) {
            const teacherConflict = await this.prisma.classSession.findFirst({
                where: {
                    sessionDate: newDate,
                    startTime: { lte: newEndTime },
                    endTime: { gte: newStartTime },
                    id: { not: excludeSessionId },
                    teacherId: currentSession.teacherId
                }
            });
            if (teacherConflict) {
                throw new Error('Giáo viên đã có buổi dạy khác trong khoảng thời gian này');
            }
        }
        if (roomId) {
            const pendingChangeConflict = await this.prisma.scheduleChange.findFirst({
                where: {
                    newDate: newDate,
                    newRoomId: roomId,
                    status: 'pending',
                    OR: [
                        {
                            newTime: {
                                contains: newStartTime
                            }
                        },
                        {
                            newTime: {
                                contains: newEndTime
                            }
                        }
                    ]
                }
            });
            if (pendingChangeConflict) {
                throw new Error('Đã có yêu cầu thay đổi lịch khác đang chờ xử lý cho phòng học này trong khoảng thời gian này');
            }
        }
    }
    async createSession(teacherId, dto) {
        try {
            const classInfo = await this.prisma.class.findFirst({
                where: { id: dto.classId, teacherId: teacherId },
                select: { id: true, academicYear: true }
            });
            if (!classInfo) {
                throw new Error('Bạn không được phân công lớp này hoặc lớp không hoạt động');
            }
            if (dto.roomId) {
                const conflictRoom = await this.prisma.classSession.findFirst({
                    where: {
                        roomId: dto.roomId,
                        sessionDate: new Date(dto.sessionDate),
                        startTime: { lte: dto.endTime },
                        endTime: { gte: dto.startTime },
                    }
                });
                if (conflictRoom) {
                    throw new Error('Phòng học đã được sử dụng trong khoảng thời gian này');
                }
            }
            const conflictTeacher = await this.prisma.classSession.findFirst({
                where: {
                    sessionDate: new Date(dto.sessionDate),
                    startTime: { lte: dto.endTime },
                    endTime: { gte: dto.startTime },
                    teacherId: teacherId
                }
            });
            if (conflictTeacher) {
                throw new Error('Bạn đã có buổi dạy khác trùng khung giờ này');
            }
            const created = await this.prisma.classSession.create({
                data: {
                    classId: dto.classId,
                    teacherId: teacherId,
                    academicYear: classInfo.academicYear || '2024-2025',
                    sessionDate: new Date(dto.sessionDate),
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                    roomId: dto.roomId,
                    notes: dto.notes,
                },
                include: {
                    room: { select: { name: true } }
                }
            });
            return created;
        }
        catch (error) {
            throw error;
        }
    }
    async getSessionStudents(teacherId, sessionId) {
        try {
            const session = await this.prisma.classSession.findFirst({
                where: {
                    id: sessionId,
                    teacherId: teacherId
                },
                include: {
                    class: {
                        include: {
                            enrollments: {
                                include: {
                                    student: {
                                        include: {
                                            user: { select: { fullName: true, avatar: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    attendances: {
                        include: {
                            student: {
                                include: {
                                    user: { select: { fullName: true, avatar: true } }
                                }
                            }
                        }
                    }
                }
            });
            if (!session) {
                return [];
            }
            return session.class.enrollments.map(enrollment => {
                const attendance = session.attendances.find(att => att.studentId === enrollment.studentId);
                return {
                    id: enrollment.student.id,
                    name: enrollment.student.user.fullName || 'Chưa có tên',
                    avatar: enrollment.student.user.avatar || undefined,
                    attendanceStatus: attendance?.status || undefined
                };
            });
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy danh sách học viên: ${error.message}`);
        }
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionService);
//# sourceMappingURL=session.service.js.map