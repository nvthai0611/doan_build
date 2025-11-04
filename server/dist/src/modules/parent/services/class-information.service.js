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
exports.ClassInformationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ClassInformationService = class ClassInformationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getChildClasses(parentUserId, studentId) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId: parentUserId },
            include: {
                students: {
                    where: { id: studentId },
                },
            },
        });
        if (!parent) {
            throw new common_1.HttpException('Không tìm thấy thông tin phụ huynh', common_1.HttpStatus.NOT_FOUND);
        }
        if (parent.students.length === 0) {
            throw new common_1.HttpException('Bạn không có quyền xem thông tin học sinh này', common_1.HttpStatus.FORBIDDEN);
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId: studentId,
                status: 'studying',
                class: {
                    status: {
                        in: ['ready', 'active'],
                    },
                },
            },
            include: {
                class: {
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        room: {
                            select: {
                                name: true,
                            },
                        },
                        subject: {
                            select: {
                                name: true,
                                code: true,
                            },
                        },
                        grade: {
                            select: {
                                name: true,
                                level: true,
                            },
                        },
                        sessions: {
                            select: {
                                id: true,
                                sessionDate: true,
                                startTime: true,
                                endTime: true,
                                status: true,
                            },
                            orderBy: {
                                sessionDate: 'asc',
                            },
                        },
                    },
                },
                student: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });
        const classes = enrollments.map((enrollment) => {
            const classData = enrollment.class;
            const totalSessions = classData.sessions.length;
            const completedSessions = classData.sessions.filter((s) => s.status === 'completed').length;
            const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
            const scheduleMap = new Map();
            classData.sessions.forEach((session) => {
                const date = new Date(session.sessionDate);
                const dayIndex = date.getDay();
                const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                const dayOfWeek = dayNames[dayIndex];
                const key = `${dayOfWeek}-${session.startTime}-${session.endTime}`;
                if (!scheduleMap.has(key)) {
                    scheduleMap.set(key, {
                        dayOfWeek: dayOfWeek,
                        startTime: session.startTime,
                        endTime: session.endTime,
                    });
                }
            });
            const schedule = Array.from(scheduleMap.values());
            return {
                id: classData.id,
                name: classData.name,
                classCode: classData.classCode || '',
                status: classData.status,
                progress: progress,
                currentStudents: classData['currentStudents'] || 0,
                maxStudents: classData['maxStudents'] || 0,
                description: classData.description || '',
                teacher: classData.teacher ? {
                    id: classData.teacher.id,
                    user: {
                        fullName: classData.teacher.user.fullName,
                        email: classData.teacher.user.email,
                    }
                } : null,
                room: classData.room ? {
                    name: classData.room.name,
                } : null,
                subject: classData.subject ? {
                    name: classData.subject.name,
                    code: classData.subject['code'],
                } : null,
                grade: classData.grade ? {
                    name: classData.grade.name,
                    level: classData.grade.level,
                } : null,
                schedule: schedule,
                startDate: classData.actualStartDate || classData['expectedStartDate'],
                endDate: classData.actualEndDate || classData['expectedEndDate'],
                studentName: enrollment.student.user.fullName,
                enrolledAt: enrollment.enrolledAt,
                totalSessions: totalSessions,
                completedSessions: completedSessions,
            };
        });
        return classes;
    }
    async getAllChildrenClasses(parentUserId) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId: parentUserId },
            include: {
                students: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });
        if (!parent) {
            throw new common_1.HttpException('Không tìm thấy thông tin phụ huynh', common_1.HttpStatus.NOT_FOUND);
        }
        const studentIds = parent.students.map((s) => s.id);
        if (studentIds.length === 0) {
            return [];
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId: {
                    in: studentIds,
                },
                status: 'studying',
                class: {
                    status: {
                        in: ['ready', 'active'],
                    },
                },
            },
            include: {
                class: {
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        room: {
                            select: {
                                name: true,
                            },
                        },
                        subject: {
                            select: {
                                name: true,
                                code: true,
                            },
                        },
                        grade: {
                            select: {
                                name: true,
                                level: true,
                            },
                        },
                        sessions: {
                            select: {
                                id: true,
                                sessionDate: true,
                                startTime: true,
                                endTime: true,
                                status: true,
                            },
                            orderBy: {
                                sessionDate: 'asc',
                            },
                        },
                    },
                },
                student: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });
        const classes = enrollments.map((enrollment) => {
            const classData = enrollment.class;
            const totalSessions = classData.sessions.length;
            const completedSessions = classData.sessions.filter((s) => s.status === 'completed').length;
            const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
            const scheduleMap = new Map();
            classData.sessions.forEach((session) => {
                const date = new Date(session.sessionDate);
                const dayIndex = date.getDay();
                const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                const dayOfWeek = dayNames[dayIndex];
                const key = `${dayOfWeek}-${session.startTime}-${session.endTime}`;
                if (!scheduleMap.has(key)) {
                    scheduleMap.set(key, {
                        dayOfWeek: dayOfWeek,
                        startTime: session.startTime,
                        endTime: session.endTime,
                    });
                }
            });
            const schedule = Array.from(scheduleMap.values());
            return {
                id: classData.id,
                name: classData.name,
                classCode: classData.classCode || '',
                status: classData.status,
                progress: progress,
                currentStudents: classData['currentStudents'] || 0,
                maxStudents: classData['maxStudents'] || 0,
                description: classData.description || '',
                teacher: classData.teacher ? {
                    id: classData.teacher.id,
                    user: {
                        fullName: classData.teacher.user.fullName,
                        email: classData.teacher.user.email,
                    }
                } : null,
                room: classData.room ? {
                    name: classData.room.name,
                } : null,
                subject: classData.subject ? {
                    name: classData.subject.name,
                    code: classData.subject['code'],
                } : null,
                grade: classData.grade ? {
                    name: classData.grade.name,
                    level: classData.grade.level,
                } : null,
                schedule: schedule,
                startDate: classData.actualStartDate || classData['expectedStartDate'],
                endDate: classData.actualEndDate || classData['expectedEndDate'],
                studentName: enrollment.student.user.fullName,
                enrolledAt: enrollment.enrolledAt,
                totalSessions: totalSessions,
                completedSessions: completedSessions,
            };
        });
        return classes;
    }
};
exports.ClassInformationService = ClassInformationService;
exports.ClassInformationService = ClassInformationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassInformationService);
//# sourceMappingURL=class-information.service.js.map