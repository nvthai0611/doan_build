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
                email: string;
                fullName: string;
                avatar: string;
                phone: string;
                id: string;
            };
        };
        thaiDoHoc: any;
        kyNangLamViecNhom: any;
    }[]>;
}
