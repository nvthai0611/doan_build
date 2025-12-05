import { QueryScheduleDto, QueryScheduleMonthDto, QueryScheduleWeekDto } from '../dto/schedule/query-schedule.dto';
import { PrismaService } from 'src/db/prisma.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
export declare class ScheduleManagementService {
    private prisma;
    private emailNotificationService;
    constructor(prisma: PrismaService, emailNotificationService: EmailNotificationService);
    private mapSessionToClientShape;
    getScheduleByDay(queryDto: QueryScheduleDto): Promise<{
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
    }[]>;
    getScheduleByWeek(queryDto: QueryScheduleWeekDto): Promise<{
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
    }[]>;
    getScheduleByMonth(queryDto: QueryScheduleMonthDto): Promise<{
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
    }[]>;
    getAllActiveClassesWithSchedules(expectedStartDate?: string): Promise<{
        classId: string;
        className: string;
        teacherId: string;
        teacherName: string;
        subjectName: string;
        roomId: string;
        roomName: string;
        expectedStartDate: Date;
        actualStartDate: Date;
        actualEndDate: Date;
        schedules: any;
    }[]>;
    getSessionById(sessionId: string): Promise<{
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
            name: string;
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                    avatar: string;
                };
                id: string;
            };
            subject: {
                name: string;
                id: string;
            };
            grade: {
                name: string;
                id: string;
            };
            id: string;
            _count: {
                enrollments: number;
            };
            classCode: string;
        };
        room: {
            name: string;
            id: string;
            capacity: number;
        };
        teacher: {
            user: {
                fullName: string;
                email: string;
                phone: string;
                id: string;
                avatar: string;
            };
            id: string;
        };
        attendanceCount: number;
    }>;
    getSessionAttendance(sessionId: string): Promise<{
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
                fullName: string;
                email: string;
                phone: string;
                id: string;
                avatar: string;
            };
        };
        thaiDoHoc: any;
        kyNangLamViecNhom: any;
    }[]>;
    updateSession(sessionId: string, body: any): Promise<{
        status: string;
        roomId: string | null;
        teacherId: string | null;
        createdAt: Date;
        academicYear: string;
        id: string;
        notes: string | null;
        classId: string;
        substituteTeacherId: string | null;
        substituteEndDate: Date | null;
        sessionDate: Date;
        startTime: string;
        endTime: string;
        cancellationReason: string | null;
    }>;
    checkScheduleConflict(sessionId: string, sessionDate: string, startTime: string, endTime: string): Promise<{
        hasConflict: boolean;
        conflicts: {
            id: string;
            className: string;
            classCode: string;
            notes: string;
            startTime: string;
            endTime: string;
        }[];
    }>;
    getTeachersInSessionsToday(query: any): Promise<{
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
    }>;
}
