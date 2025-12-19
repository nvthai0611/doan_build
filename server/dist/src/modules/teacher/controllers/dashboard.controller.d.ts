import { TeacherDashboardService } from '../services/dashboard.service';
interface AuthRequest extends Request {
    user: {
        teacherId: string;
        userId: string;
        role: string;
    };
}
export declare class TeacherDashboardController {
    private readonly dashboardService;
    constructor(dashboardService: TeacherDashboardService);
    getStats(req: AuthRequest): Promise<{
        data: {
            totalStudents: number;
            totalClasses: number;
            todaySessions: number;
            completedSessions: number;
        };
    }>;
    getTodaySessions(req: AuthRequest): Promise<{
        data: {
            id: string;
            className: string;
            subjectName: string;
            sessionDate: string;
            startTime: string;
            endTime: string;
            roomName: string;
            status: string;
        }[];
    }>;
}
export {};
