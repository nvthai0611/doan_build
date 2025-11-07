import { QueryScheduleDto, QueryScheduleMonthDto, QueryScheduleWeekDto } from '../dto/schedule/query-schedule.dto';
import { PrismaService } from 'src/db/prisma.service';
export declare class ScheduleManagementService {
    private prisma;
    constructor(prisma: PrismaService);
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
                id: string;
                email: string;
                fullName: string;
                avatar: string;
                phone: string;
            };
        };
        thaiDoHoc: any;
        kyNangLamViecNhom: any;
    }[]>;
    updateSession(sessionId: string, body: any): Promise<{
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
