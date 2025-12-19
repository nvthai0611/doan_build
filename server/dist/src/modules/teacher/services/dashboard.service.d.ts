import { PrismaService } from '../../../db/prisma.service';
export declare class TeacherDashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(teacherId: string): Promise<{
        totalStudents: number;
        totalClasses: number;
        todaySessions: number;
        completedSessions: number;
    }>;
    getTodaySessions(teacherId: string): Promise<{
        id: string;
        className: string;
        subjectName: string;
        sessionDate: string;
        startTime: string;
        endTime: string;
        roomName: string;
        status: string;
    }[]>;
}
