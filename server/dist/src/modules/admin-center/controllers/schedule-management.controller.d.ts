import { ScheduleManagementService } from '../services/schedule-management.service';
import { QueryScheduleDto, QueryScheduleMonthDto, QueryScheduleWeekDto } from '../dto/schedule/query-schedule.dto';
export declare class ScheduleManagementController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleManagementService);
    getByDay(query: QueryScheduleDto): Promise<{
        data: {
            id: any;
            name: any;
            date: any;
            startTime: any;
            endTime: any;
            roomName: any;
            teacherName: any;
            subjectName: any;
            studentCount: any;
            maxStudents: any;
            status: any;
        }[];
        message: string;
    }>;
    getByWeek(query: QueryScheduleWeekDto): Promise<{
        data: {
            id: any;
            name: any;
            date: any;
            startTime: any;
            endTime: any;
            roomName: any;
            teacherName: any;
            subjectName: any;
            studentCount: any;
            maxStudents: any;
            status: any;
        }[];
        message: string;
    }>;
    getByMonth(query: QueryScheduleMonthDto): Promise<{
        data: {
            id: any;
            name: any;
            date: any;
            startTime: any;
            endTime: any;
            roomName: any;
            teacherName: any;
            subjectName: any;
            studentCount: any;
            maxStudents: any;
            status: any;
        }[];
        message: string;
    }>;
    getSessionById(sessionId: string): Promise<{
        data: {
            id: string;
            name: string;
            topic: string;
            sessionDate: Date;
            startTime: string;
            endTime: string;
            status: string;
            notes: string;
            academicYear: string;
            cancellationReason: string;
            createdAt: Date;
            class: {
                teacher: {
                    user: {
                        email: string;
                        fullName: string;
                        avatar: string;
                        phone: string;
                        id: string;
                    };
                    id: string;
                };
                subject: {
                    id: string;
                    name: string;
                };
                grade: {
                    id: string;
                    name: string;
                };
                id: string;
                _count: {
                    enrollments: number;
                };
                name: string;
                classCode: string;
            };
            room: {
                id: string;
                name: string;
                capacity: number;
            };
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                    id: string;
                };
                id: string;
            };
            attendanceCount: number;
        };
        message: string;
    }>;
    getSessionAttendance(sessionId: string): Promise<{
        data: {
            id: string;
            sessionId: string;
            studentId: string;
            studentName: string;
            studentCode: string;
            status: string;
            checkInTime: Date;
            checkOutTime: any;
            note: string;
            recordedBy: string;
            recordedAt: Date;
            isSent: boolean;
            sentAt: Date;
            student: {
                id: string;
                studentCode: string;
                user: {
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                    id: string;
                };
            };
            thaiDoHoc: any;
            kyNangLamViecNhom: any;
        }[];
        message: string;
    }>;
    getAllActiveClassesWithSchedules(query: any): Promise<{
        data: {
            classId: string;
            className: string;
            teacherName: string;
            subjectName: string;
            roomId: string;
            roomName: string;
            expectedStartDate: Date;
            actualStartDate: Date;
            actualEndDate: Date;
            schedules: any;
        }[];
        message: string;
    }>;
}
