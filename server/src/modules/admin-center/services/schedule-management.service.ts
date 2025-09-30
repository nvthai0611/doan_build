import { Injectable } from '@nestjs/common';
import { QueryScheduleDto, QueryScheduleMonthDto, QueryScheduleWeekDto } from '../dto/schedule/query-schedule.dto';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ScheduleManagementService {
    constructor(private prisma: PrismaService) {}

    private mapSessionToClientShape(session: any) {
        return {
            id: session.id,
            name: session.class?.name || '',
            date: session.sessionDate.toISOString().slice(0, 10),
            startTime: session.startTime,
            endTime: session.endTime,
            roomName: session.room?.name || null,
            teacherName: session.class?.teacherClassAssignments?.[0]?.teacher?.user?.fullName || '',
            subjectName: session.class?.subject?.name || '',
            studentCount:
                (session.class?._count && session.class._count.enrollments) || 0,
            maxStudents: session.class?.maxStudents ?? 0,
            status: session.status,
        };
    }

    async getScheduleByDay(queryDto: QueryScheduleDto) {
        const { date } = queryDto;
        if (!date) return [];
        const sessions = await this.prisma.classSession.findMany({
            where: { sessionDate: new Date(date) },
            orderBy: { startTime: 'asc' },
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacherClassAssignments: {
                            select: {
                                teacher: { select: { user: { select: { fullName: true } } } }
                            },
                            take: 1
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }

    async getScheduleByWeek(queryDto: QueryScheduleWeekDto) {
        const { startDate, endDate } = queryDto;
        const start = new Date(startDate);
        const end = new Date(endDate);
        // bao gồm cả endDate: dùng lte
        const sessions = await this.prisma.classSession.findMany({
            where: { sessionDate: { gte: start, lte: end } },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacherClassAssignments: {
                            select: {
                                teacher: { select: { user: { select: { fullName: true } } } }
                            },
                            take: 1
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }

    async getScheduleByMonth(queryDto: QueryScheduleMonthDto) {
        const { month, year } = queryDto;
        const monthNum = Number(month);
        const yearNum = Number(year);
        const firstDay = new Date(Date.UTC(yearNum, monthNum - 1, 1));
        const firstDayNextMonth = new Date(Date.UTC(yearNum, monthNum, 1));
        // dùng lt next month để bao toàn bộ tháng
        const sessions = await this.prisma.classSession.findMany({
            where: { sessionDate: { gte: firstDay, lt: firstDayNextMonth } },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacherClassAssignments: {
                            select: {
                                teacher: { select: { user: { select: { fullName: true } } } }
                            },
                            take: 1
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }
}
