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
exports.ParentOverviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ParentOverviewService = class ParentOverviewService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getParentOverview(parentUserId, date) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId: parentUserId },
            include: {
                user: {
                    select: {
                        fullName: true,
                        gender: true,
                    },
                },
                students: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                        enrollments: {
                            where: {
                                status: 'studying',
                                class: {
                                    status: 'active',
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
                                                        fullName: true,
                                                    },
                                                },
                                            },
                                        },
                                        room: true,
                                        sessions: {
                                            where: {
                                                sessionDate: date
                                                    ? new Date(date)
                                                    : {
                                                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                                        lte: new Date(new Date().setHours(23, 59, 59, 999)),
                                                    },
                                            },
                                            orderBy: {
                                                startTime: 'asc',
                                            },
                                            include: {
                                                attendances: {
                                                    where: {
                                                        student: {
                                                            parentId: {
                                                                equals: await this.prisma.parent
                                                                    .findUnique({
                                                                    where: { userId: parentUserId },
                                                                    select: { id: true },
                                                                })
                                                                    .then((p) => p?.id || ''),
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!parent) {
            throw new common_1.HttpException('Không tìm thấy thông tin phụ huynh', common_1.HttpStatus.NOT_FOUND);
        }
        const upcomingLessons = [];
        const activeClasses = [];
        for (const student of parent.students) {
            for (const enrollment of student.enrollments) {
                const classData = enrollment.class;
                const allSessions = await this.prisma.classSession.findMany({
                    where: {
                        classId: classData.id,
                        status: {
                            not: 'day_off',
                        },
                    },
                });
                const totalSessions = allSessions.length || 1;
                const completedSessions = allSessions.filter((s) => s.status === 'end').length || 0;
                const progress = Math.round((completedSessions / totalSessions) * 100);
                const nextSession = await this.prisma.classSession.findFirst({
                    where: {
                        classId: classData.id,
                        status: 'has_not_happened',
                        sessionDate: {
                            gte: new Date(),
                        },
                    },
                    orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
                });
                let scheduleText = 'Chưa có lịch';
                if (allSessions && allSessions.length > 0) {
                    const scheduleMap = new Map();
                    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                    allSessions.forEach((session) => {
                        const date = new Date(session.sessionDate);
                        const dayIndex = date.getDay();
                        const dayOfWeek = dayNames[dayIndex];
                        const key = `${dayIndex}-${session.startTime}-${session.endTime}`;
                        if (!scheduleMap.has(key)) {
                            scheduleMap.set(key, {
                                dayIndex: dayIndex,
                                dayOfWeek: dayOfWeek,
                                startTime: session.startTime,
                                endTime: session.endTime,
                            });
                        }
                    });
                    const schedule = Array.from(scheduleMap.values());
                    if (schedule.length > 0) {
                        const timeGroups = new Map();
                        schedule.forEach(s => {
                            const timeKey = `${s.startTime}-${s.endTime}`;
                            if (!timeGroups.has(timeKey)) {
                                timeGroups.set(timeKey, []);
                            }
                            timeGroups.get(timeKey).push({ dayIndex: s.dayIndex, dayOfWeek: s.dayOfWeek });
                        });
                        const scheduleTexts = Array.from(timeGroups.entries()).map(([timeKey, daysData]) => {
                            const [startTime, endTime] = timeKey.split('-');
                            daysData.sort((a, b) => a.dayIndex - b.dayIndex);
                            const days = daysData.map(d => d.dayOfWeek).join(', ');
                            return `${days}: ${startTime} - ${endTime}`;
                        });
                        scheduleText = scheduleTexts.join(' | ');
                    }
                }
                let nextClassInfo = 'Chưa có lịch';
                if (nextSession) {
                    const sessionDate = new Date(nextSession.sessionDate);
                    const dayOfWeek = [
                        'Chủ nhật',
                        'Thứ hai',
                        'Thứ ba',
                        'Thứ tư',
                        'Thứ năm',
                        'Thứ sáu',
                        'Thứ bảy',
                    ][sessionDate.getDay()];
                    const dateStr = `${sessionDate.getDate().toString().padStart(2, '0')}/${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}/${sessionDate.getFullYear()}`;
                    nextClassInfo = `${dayOfWeek}, ${dateStr} (${nextSession.startTime} - ${nextSession.endTime})`;
                }
                activeClasses.push({
                    id: classData.id,
                    name: classData.name,
                    subject: classData.subject.name,
                    teacher: classData.teacher?.user?.fullName || 'Chưa phân công',
                    room: classData.room?.name || 'Chưa phân phòng',
                    progress,
                    schedule: scheduleText,
                    studentName: student.user.fullName,
                    nextClass: nextClassInfo,
                });
                classData.sessions.forEach((session) => {
                    const attendance = session.attendances.find((a) => a.studentId === student.id);
                    upcomingLessons.push({
                        id: session.id,
                        className: classData.name,
                        subject: classData.subject.name,
                        time: `${session.startTime} - ${session.endTime}`,
                        room: classData.room?.name || 'Chưa phân phòng',
                        teacher: classData.teacher?.user?.fullName || 'Chưa phân công',
                        status: session.status === 'has_not_happened'
                            ? 'Chưa diễn ra'
                            : session.status === 'happening'
                                ? 'Đang diễn ra'
                                : session.status === 'end'
                                    ? 'Đã kết thúc'
                                    : session.status === 'day_off'
                                        ? 'Nghỉ học'
                                        : 'Chưa diễn ra',
                        attendanceStatus: attendance
                            ? attendance.status === 'present'
                                ? 'Có mặt'
                                : attendance.status === 'absent'
                                    ? 'Vắng'
                                    : 'Chưa điểm danh'
                            : 'Chưa điểm danh',
                        studentName: student.user.fullName,
                    });
                });
            }
        }
        return {
            parentName: parent.user.fullName || 'Phụ huynh',
            gender: parent.user.gender,
            upcomingLessons,
            activeClasses,
            studentCount: parent.students.length,
        };
    }
};
exports.ParentOverviewService = ParentOverviewService;
exports.ParentOverviewService = ParentOverviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParentOverviewService);
//# sourceMappingURL=parent-overview.service.js.map