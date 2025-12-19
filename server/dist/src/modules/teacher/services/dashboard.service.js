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
exports.TeacherDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let TeacherDashboardService = class TeacherDashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(teacherId) {
        const classes = await this.prisma.class.findMany({
            where: { teacherId },
            include: {
                enrollments: {
                    where: { status: 'studying' },
                },
            },
        });
        const totalStudents = classes.reduce((sum, cls) => sum + cls.enrollments.length, 0);
        const totalClasses = classes.length;
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        const todaySessions = await this.prisma.classSession.count({
            where: {
                OR: [
                    { teacherId },
                    { substituteTeacherId: teacherId },
                ],
                sessionDate: {
                    equals: new Date(todayStr),
                },
            },
        });
        const completedSessions = await this.prisma.classSession.count({
            where: {
                OR: [
                    { teacherId },
                    { substituteTeacherId: teacherId },
                ],
                sessionDate: {
                    equals: new Date(todayStr),
                },
                status: 'end',
            },
        });
        return {
            totalStudents,
            totalClasses,
            todaySessions,
            completedSessions,
        };
    }
    async getTodaySessions(teacherId) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        const sessions = await this.prisma.classSession.findMany({
            where: {
                OR: [
                    { teacherId },
                    { substituteTeacherId: teacherId },
                ],
                sessionDate: {
                    equals: new Date(todayStr),
                },
            },
            include: {
                class: {
                    include: {
                        subject: true,
                    },
                },
                room: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        });
        return sessions.map((session) => ({
            id: session.id,
            className: session.class.name,
            subjectName: session.class.subject?.name || 'Chưa xác định',
            sessionDate: session.sessionDate.toISOString(),
            startTime: session.startTime,
            endTime: session.endTime,
            roomName: session.room?.name || 'Chưa xác định',
            status: session.status,
        }));
    }
};
exports.TeacherDashboardService = TeacherDashboardService;
exports.TeacherDashboardService = TeacherDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeacherDashboardService);
//# sourceMappingURL=dashboard.service.js.map