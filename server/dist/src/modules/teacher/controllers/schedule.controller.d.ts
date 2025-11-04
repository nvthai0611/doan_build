import { ScheduleService } from '../services/schedule.service';
import { UpdateScheduleStatusDto } from '../dto/schedule/update-schedule-status.dto';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    getWeeklySchedule(req: any, weekStart: string): Promise<{
        success: boolean;
        data: {
            id: string;
            date: string;
            startTime: string;
            endTime: string;
            subject: string;
            className: string;
            room: string;
            studentCount: number;
            status: string;
            notes: string;
            type: string;
            teacherId: string;
            academicYear: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        message: string;
    }>;
    getMonthlySchedule(req: any, year: number, month: number): Promise<{
        success: boolean;
        data: {
            id: string;
            date: string;
            startTime: string;
            endTime: string;
            subject: string;
            className: string;
            room: string;
            studentCount: number;
            status: string;
            notes: string;
            type: string;
            teacherId: string;
            academicYear: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        message: string;
    }>;
    getScheduleDetail(req: any, scheduleId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            date: string;
            startTime: string;
            endTime: string;
            subject: string;
            className: string;
            room: string;
            studentCount: number;
            status: string;
            notes: string;
            type: string;
            teacherId: string;
            academicYear: string;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
    updateScheduleStatus(req: any, scheduleId: string, updateStatusDto: UpdateScheduleStatusDto): Promise<{
        success: boolean;
        data: {
            id: string;
            date: string;
            startTime: string;
            endTime: string;
            subject: string;
            className: string;
            room: string;
            studentCount: number;
            status: string;
            notes: string;
            type: string;
            teacherId: string;
            academicYear: string;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
}
