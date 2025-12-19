import { PrismaService } from '../../../db/prisma.service';
export declare class ClassManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    getClassByTeacherId(teacherId: string, status: string, page: number, limit: number, search?: string): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            grade: {
                level: number;
                isActive: boolean;
                id: string;
                name: string;
                description: string | null;
            };
            maxStudents: number;
            status: string;
            academicYear: string;
            expectedStartDate: Date;
            actualStartDate: Date;
            actualEndDate: Date;
            createdAt: Date;
            updatedAt: Date;
            teacherName: string;
            teacherEmail: string;
            teacherId: string;
            subject: {
                id: string;
                name: string;
                description: string | null;
                code: string;
            };
            subjectId: string;
            room: {
                createdAt: Date;
                isActive: boolean;
                id: string;
                name: string;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            roomId: string;
            studentCount: number;
            feeStructure: {
                createdAt: Date;
                isActive: boolean;
                id: string;
                name: string;
                description: string | null;
                subjectId: string | null;
                gradeId: string | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                period: string;
            };
            feeStructureId: string;
            schedule: any;
            enrollmentStatus: {
                current: number;
                max: number;
                percentage: number;
                available: number;
                isFull: boolean;
                status: string;
            };
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalCount: number;
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        filters: {
            search: string;
            status: string;
        };
    }>;
    getCountByStatus(teacherId: string): Promise<{
        total: number;
        active: number;
        draft: number;
        completed: number;
        cancelled: number;
        ready: number;
    }>;
    getClassDetail(teacherId: string, classId: string): Promise<{
        id: string;
        name: string;
        description: string;
        grade: {
            level: number;
            isActive: boolean;
            id: string;
            name: string;
            description: string | null;
        };
        maxStudents: number;
        status: string;
        academicYear: string;
        expectedStartDate: Date;
        actualStartDate: Date;
        actualEndDate: Date;
        createdAt: Date;
        updatedAt: Date;
        room: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        };
        subject: {
            id: string;
            name: string;
            description: string | null;
            code: string;
        };
        emrollments: ({
            student: {
                user: {
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                    id: string;
                };
                studentCode: string;
            };
        } & {
            id: bigint;
            status: string;
            studentId: string;
            classId: string;
            enrolledAt: Date;
            semester: string | null;
            completedAt: Date | null;
            finalGrade: string | null;
            completionStatus: string | null;
            completionNotes: string | null;
        })[];
        studentCount: number;
        classSession: {
            total: number;
            completed: number;
            upcoming: number;
            attendanceRate: number;
            averageAttendancePerSession: number;
            totalPresentCount: number;
            totalAbsentCount: number;
            totalExcusedCount: number;
        };
        schedule: any;
    }>;
    getHistoryAttendanceOfClass(classId: string, teacherId: string): Promise<({
        attendances: ({
            student: {
                user: {
                    role: string;
                    email: string | null;
                    password: string;
                    createdAt: Date;
                    fullName: string | null;
                    isActive: boolean;
                    avatar: string | null;
                    phone: string | null;
                    roleId: string | null;
                    updatedAt: Date;
                    username: string;
                    id: string;
                    gender: import(".prisma/client").$Enums.Gender | null;
                    birthDate: Date | null;
                };
                id: string;
            };
        } & {
            id: bigint;
            sessionId: string;
            status: string;
            studentId: string;
            note: string | null;
            recordedBy: string;
            recordedAt: Date;
            isSent: boolean;
            sentAt: Date | null;
        })[];
    } & {
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
    })[]>;
}
