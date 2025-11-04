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
exports.StudentScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const session_status_util_1 = require("../../../utils/session-status.util");
let StudentScheduleService = class StudentScheduleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWeeklySchedule(studentId, weekStart) {
        if (!studentId || !weekStart)
            return [];
        const start = new Date(weekStart);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const sessions = await this.prisma.classSession.findMany({
            where: {
                sessionDate: { gte: start, lte: end },
                class: {
                    status: 'active',
                    enrollments: {
                        some: {
                            studentId,
                            status: {
                                in: ['active', 'studying']
                            },
                        },
                    },
                },
            },
            include: {
                class: {
                    include: {
                        subject: true,
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                room: true,
                teacher: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                attendances: {
                    where: { studentId },
                    select: {
                        id: true,
                        status: true,
                        note: true,
                        recordedAt: true,
                    },
                    take: 1,
                },
            },
            orderBy: [
                { sessionDate: 'asc' },
                { startTime: 'asc' },
            ],
        });
        return sessions.map((s) => {
            const hasAttendance = s.attendances && s.attendances.length > 0;
            return {
                ...s,
                status: (0, session_status_util_1.getSessionStatus)(s, hasAttendance ? undefined : 'no_attendance'),
                attendanceStatus: s.attendances?.[0]?.status ?? null,
                attendanceNote: s.attendances?.[0]?.note ?? null,
                attendanceRecordedAt: s.attendances?.[0]?.recordedAt ?? null,
                attendanceRecordedBy: s.attendances?.[0]?.recordedByUser ?? null,
            };
        });
    }
    async getMonthlySchedule(studentId, year, month) {
        if (!studentId || !year || !month)
            return [];
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        const sessions = await this.prisma.classSession.findMany({
            where: {
                sessionDate: { gte: start, lte: end },
                class: {
                    status: 'active',
                    enrollments: {
                        some: {
                            studentId,
                            status: {
                                in: ['active', 'studying']
                            },
                        },
                    },
                },
            },
            include: {
                class: {
                    include: {
                        subject: true,
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                room: true,
                teacher: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                attendances: {
                    where: { studentId },
                    select: {
                        id: true,
                        status: true,
                        note: true,
                        recordedAt: true,
                    },
                    take: 1,
                },
            },
            orderBy: [
                { sessionDate: 'asc' },
                { startTime: 'asc' },
            ],
        });
        return sessions.map((s) => {
            const hasAttendance = s.attendances && s.attendances.length > 0;
            return {
                ...s,
                status: (0, session_status_util_1.getSessionStatus)(s, hasAttendance ? undefined : 'no_attendance'),
                attendanceStatus: s.attendances?.[0]?.status ?? null,
                attendanceNote: s.attendances?.[0]?.note ?? null,
                attendanceRecordedAt: s.attendances?.[0]?.recordedAt ?? null,
                attendanceRecordedBy: s.attendances?.[0]?.recordedByUser ?? null,
            };
        });
    }
    async getSchedule(studentId, filters) {
        if (!studentId)
            return [];
        const { startDate, endDate } = filters || {};
        const sessions = await this.prisma.classSession.findMany({
            where: {
                ...(startDate ? { sessionDate: { gte: new Date(startDate) } } : {}),
                ...(endDate ? { sessionDate: { lte: new Date(endDate) } } : {}),
                class: {
                    status: 'active',
                    enrollments: {
                        some: {
                            studentId,
                            status: {
                                in: ['active', 'studying']
                            },
                        },
                    },
                },
            },
            include: {
                class: {
                    include: {
                        subject: true,
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    },
                },
                room: true,
                teacher: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                attendances: {
                    where: { studentId },
                    select: {
                        id: true,
                        status: true,
                        note: true,
                        recordedAt: true,
                    },
                    take: 1,
                },
            },
            orderBy: [
                { sessionDate: 'asc' },
                { startTime: 'asc' },
            ],
        });
        return sessions.map((s) => {
            const hasAttendance = s.attendances && s.attendances.length > 0;
            return {
                ...s,
                status: (0, session_status_util_1.getSessionStatus)(s, hasAttendance ? undefined : 'no_attendance'),
                attendanceStatus: s.attendances?.[0]?.status ?? null,
                attendanceNote: s.attendances?.[0]?.note ?? null,
                attendanceRecordedAt: s.attendances?.[0]?.recordedAt ?? null,
                attendanceRecordedBy: s.attendances?.[0]?.recordedByUser ?? null,
            };
        });
    }
    async getSessionById(studentId, sessionId) {
        if (!studentId || !sessionId)
            return null;
        const session = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
            include: {
                class: {
                    include: {
                        subject: true,
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                room: true,
                teacher: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                attendances: {
                    where: { studentId },
                    select: {
                        id: true,
                        status: true,
                        note: true,
                        recordedAt: true,
                    },
                    take: 1
                },
            },
        });
        if (!session)
            return null;
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                studentId,
                classId: session.classId,
                status: 'active'
            }
        });
        if (!enrollment) {
            throw new Error('Học sinh không được ghi danh vào lớp này');
        }
        return {
            ...session,
            attendanceStatus: session.attendances?.[0]?.status ?? null,
            attendanceNote: session.attendances?.[0]?.note ?? null,
            attendanceRecordedAt: session.attendances?.[0]?.recordedAt ?? null,
        };
    }
    async getScheduleDetail(studentId, id) {
        if (!studentId || !id)
            return null;
        const session = await this.prisma.classSession.findUnique({
            where: { id },
            include: {
                class: {
                    include: {
                        subject: true,
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                room: true,
                teacher: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                attendances: {
                    where: { studentId },
                    select: {
                        id: true,
                        status: true,
                        note: true,
                        recordedAt: true,
                    },
                    take: 1
                },
            },
        });
        if (!session)
            return null;
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                studentId,
                classId: session.classId,
                status: 'active'
            }
        });
        if (!enrollment) {
            throw new Error('Học sinh không được ghi danh vào lớp này');
        }
        return {
            ...session,
            attendanceStatus: session.attendances?.[0]?.status ?? null,
            attendanceNote: session.attendances?.[0]?.note ?? null,
            attendanceRecordedAt: session.attendances?.[0]?.recordedAt ?? null,
        };
    }
};
exports.StudentScheduleService = StudentScheduleService;
exports.StudentScheduleService = StudentScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentScheduleService);
//# sourceMappingURL=schedule.service.js.map