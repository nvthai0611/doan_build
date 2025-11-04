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
exports.ScheduleManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ScheduleManagementService = class ScheduleManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapSessionToClientShape(session) {
        return {
            id: session.id,
            name: session.class?.name || '',
            date: session.sessionDate.toISOString().slice(0, 10),
            startTime: session.startTime,
            endTime: session.endTime,
            roomName: session.room?.name || null,
            teacherName: session.class?.teacher?.user?.fullName || '',
            subjectName: session.class?.subject?.name || '',
            studentCount: (session.class?._count && session.class._count.enrollments) || 0,
            maxStudents: session.class?.maxStudents ?? 0,
            status: session.status,
        };
    }
    async getScheduleByDay(queryDto) {
        const { date } = queryDto;
        if (!date)
            return [];
        const sessions = await this.prisma.classSession.findMany({
            where: {
                sessionDate: new Date(date),
                status: {
                    notIn: ['end', 'cancelled']
                },
                class: {
                    status: {
                        in: ['active', 'ready', 'suspended']
                    }
                }
            },
            orderBy: { startTime: 'asc' },
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true
                                    }
                                }
                            }
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }
    async getScheduleByWeek(queryDto) {
        const { startDate, endDate } = queryDto;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const sessions = await this.prisma.classSession.findMany({
            where: {
                sessionDate: { gte: start, lte: end },
                status: {
                    notIn: ['end', 'cancelled']
                },
                class: {
                    status: {
                        in: ['active', 'ready', 'suspended']
                    }
                }
            },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true
                                    }
                                }
                            }
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }
    async getScheduleByMonth(queryDto) {
        const { month, year } = queryDto;
        const monthNum = Number(month);
        const yearNum = Number(year);
        const firstDay = new Date(Date.UTC(yearNum, monthNum - 1, 1));
        const firstDayNextMonth = new Date(Date.UTC(yearNum, monthNum, 1));
        const sessions = await this.prisma.classSession.findMany({
            where: {
                sessionDate: { gte: firstDay, lt: firstDayNextMonth },
                status: {
                    notIn: ['end', 'cancelled']
                },
                class: {
                    status: {
                        in: ['active', 'ready', 'suspended']
                    }
                }
            },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true
                                    }
                                }
                            }
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }
    async getAllActiveClassesWithSchedules(expectedStartDate) {
        const classes = await this.prisma.class.findMany({
            where: {
                status: {
                    in: ['active', 'ready', 'suspended']
                },
                recurringSchedule: {
                    not: null
                }
            },
            select: {
                id: true,
                name: true,
                recurringSchedule: true,
                room: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                teacher: {
                    select: {
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                subject: {
                    select: {
                        name: true
                    }
                },
                expectedStartDate: true,
                actualStartDate: true,
                actualEndDate: true,
            },
            orderBy: { name: 'asc' },
        });
        let result = classes.map((cls) => {
            const schedule = cls.recurringSchedule;
            return {
                classId: cls.id,
                className: cls.name,
                teacherName: cls.teacher?.user?.fullName || '',
                subjectName: cls.subject?.name || '',
                roomId: cls.room?.id || null,
                roomName: cls.room?.name || null,
                expectedStartDate: cls.expectedStartDate,
                actualStartDate: cls.actualStartDate,
                actualEndDate: cls.actualEndDate,
                schedules: schedule?.schedules || [],
            };
        });
        let rangeStartDate;
        if (expectedStartDate) {
            const [year, month, day] = expectedStartDate.split('-').map(Number);
            rangeStartDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        }
        else {
            const now = new Date();
            rangeStartDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        }
        const nextYear = rangeStartDate.getUTCFullYear() + 1;
        const rangeEndDate = new Date(Date.UTC(nextYear, 4, 31, 0, 0, 0, 0));
        result = result.filter((cls) => {
            const classStartRaw = cls.actualStartDate || cls.expectedStartDate;
            if (!classStartRaw)
                return false;
            const classStart = new Date(classStartRaw);
            const classStartDate = new Date(Date.UTC(classStart.getUTCFullYear(), classStart.getUTCMonth(), classStart.getUTCDate(), 0, 0, 0, 0));
            let classEndDate;
            if (cls.actualEndDate) {
                const classEnd = new Date(cls.actualEndDate);
                classEndDate = new Date(Date.UTC(classEnd.getUTCFullYear(), classEnd.getUTCMonth(), classEnd.getUTCDate(), 0, 0, 0, 0));
            }
            else {
                const classNextYear = classStartDate.getUTCFullYear() + 1;
                classEndDate = new Date(Date.UTC(classNextYear, 4, 31, 0, 0, 0, 0));
            }
            if (classEndDate.getTime() < rangeStartDate.getTime()) {
                return false;
            }
            if (classStartDate.getTime() > rangeEndDate.getTime()) {
                return false;
            }
            return true;
        });
        return result;
    }
    async getSessionById(sessionId) {
        const session = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        classCode: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        grade: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        teacher: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        phone: true,
                                        avatar: true,
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                enrollments: true,
                            }
                        }
                    }
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                    }
                },
                teacher: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                                avatar: true,
                            }
                        }
                    }
                },
                attendances: {
                    select: {
                        id: true,
                        status: true,
                        note: true,
                        recordedAt: true,
                        student: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        avatar: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!session) {
            throw new common_1.NotFoundException('Không tìm thấy buổi học');
        }
        return {
            id: session.id,
            name: session.notes || `Buổi ${session.academicYear}`,
            topic: session.notes,
            sessionDate: session.sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status,
            notes: session.notes,
            academicYear: session.academicYear,
            cancellationReason: session.cancellationReason,
            createdAt: session.createdAt,
            class: session.class,
            room: session.room,
            teacher: session.teacher,
            attendanceCount: session.attendances.length,
        };
    }
    async getSessionAttendance(sessionId) {
        const session = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
            select: { id: true, classId: true }
        });
        if (!session) {
            throw new common_1.NotFoundException('Không tìm thấy buổi học');
        }
        const attendances = await this.prisma.studentSessionAttendance.findMany({
            where: {
                sessionId: sessionId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                                avatar: true,
                            }
                        }
                    }
                },
                recordedByTeacher: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                student: {
                    user: {
                        fullName: 'asc'
                    }
                }
            }
        });
        return attendances.map(attendance => ({
            id: attendance.id.toString(),
            sessionId: attendance.sessionId,
            studentId: attendance.studentId,
            studentName: attendance.student.user.fullName,
            studentCode: attendance.student.studentCode,
            status: attendance.status,
            checkInTime: attendance.recordedAt,
            checkOutTime: null,
            note: attendance.note,
            recordedBy: attendance.recordedByTeacher?.user?.fullName,
            recordedAt: attendance.recordedAt,
            isSent: attendance.isSent,
            sentAt: attendance.sentAt,
            student: {
                id: attendance.student.id,
                studentCode: attendance.student.studentCode,
                user: attendance.student.user,
            },
            thaiDoHoc: null,
            kyNangLamViecNhom: null,
        }));
    }
};
exports.ScheduleManagementService = ScheduleManagementService;
exports.ScheduleManagementService = ScheduleManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleManagementService);
//# sourceMappingURL=schedule-management.service.js.map