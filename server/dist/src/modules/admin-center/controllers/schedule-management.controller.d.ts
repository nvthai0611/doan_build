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
                id: string;
                classCode: string;
                name: string;
                grade: {
                    id: string;
                    name: string;
                };
                subject: {
                    id: string;
                    name: string;
                };
                teacher: {
                    id: string;
                    user: {
                        id: string;
                        email: string;
                        fullName: string;
                        avatar: string;
                        phone: string;
                    };
                };
                _count: {
                    enrollments: number;
                };
            };
            room: {
                id: string;
                name: string;
                capacity: number;
            };
            teacher: {
                id: string;
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                };
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
                    id: string;
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
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
    updateSession(sessionId: string, body: any): Promise<{
        data: {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            status: string;
            academicYear: string;
            classId: string;
            substituteTeacherId: string | null;
            substituteEndDate: Date | null;
            sessionDate: Date;
            startTime: string;
            endTime: string;
            notes: string | null;
            cancellationReason: string | null;
        };
        message: string;
    }>;
    getTeachersInSessionsToday(query: any): Promise<{
        message: string;
        data: {
            id: string;
            stt: number;
            teacher: {
                id: string;
                userId: string;
                fullName: string;
                avatar: string;
                teacherCode: string;
                email: any;
            };
            role: string;
            session: {
                id: string;
                sessionNumber: string;
                status: string;
                sessionDate: string;
                startTime: string;
                endTime: string;
                dateTimeRange: string;
            };
            class: {
                id: string;
                name: string;
                classCode: string;
                subject: string;
            };
            enrollmentCount: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        success: boolean;
    }>;
}
