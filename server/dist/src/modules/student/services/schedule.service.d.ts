import { PrismaService } from '../../../db/prisma.service';
import { ScheduleFiltersDto } from '../dto/schedule-filters.dto';
export declare class StudentScheduleService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWeeklySchedule(studentId: string, weekStart: string): Promise<any[]>;
    getMonthlySchedule(studentId: string, year: number, month: number): Promise<any[]>;
    getSchedule(studentId: string, filters: ScheduleFiltersDto): Promise<any[]>;
    getSessionById(studentId: string, sessionId: string): Promise<{
        attendanceStatus: string;
        attendanceNote: string;
        attendanceRecordedAt: Date;
        teacher: {
            user: {
                email: string;
                fullName: string;
                phone: string;
                id: string;
            };
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
        class: {
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                    id: string;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            subject: {
                id: string;
                name: string;
                description: string | null;
                code: string;
            };
        } & {
            academicYear: string | null;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            name: string;
            description: string | null;
            subjectId: string;
            gradeId: string | null;
            maxStudents: number | null;
            roomId: string | null;
            teacherId: string | null;
            status: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            feeStructureId: string | null;
            classCode: string | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
        };
        room: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        };
        attendances: {
            id: bigint;
            status: string;
            note: string;
            recordedAt: Date;
        }[];
        academicYear: string;
        createdAt: Date;
        id: string;
        roomId: string | null;
        teacherId: string | null;
        status: string;
        classId: string;
        substituteTeacherId: string | null;
        substituteEndDate: Date | null;
        sessionDate: Date;
        startTime: string;
        endTime: string;
        notes: string | null;
        cancellationReason: string | null;
    }>;
    getScheduleDetail(studentId: string, id: string): Promise<{
        attendanceStatus: string;
        attendanceNote: string;
        attendanceRecordedAt: Date;
        teacher: {
            user: {
                email: string;
                fullName: string;
                phone: string;
                id: string;
            };
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
        class: {
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                    id: string;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            subject: {
                id: string;
                name: string;
                description: string | null;
                code: string;
            };
        } & {
            academicYear: string | null;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            name: string;
            description: string | null;
            subjectId: string;
            gradeId: string | null;
            maxStudents: number | null;
            roomId: string | null;
            teacherId: string | null;
            status: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            feeStructureId: string | null;
            classCode: string | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
        };
        room: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        };
        attendances: {
            id: bigint;
            status: string;
            note: string;
            recordedAt: Date;
        }[];
        academicYear: string;
        createdAt: Date;
        id: string;
        roomId: string | null;
        teacherId: string | null;
        status: string;
        classId: string;
        substituteTeacherId: string | null;
        substituteEndDate: Date | null;
        sessionDate: Date;
        startTime: string;
        endTime: string;
        notes: string | null;
        cancellationReason: string | null;
    }>;
}
