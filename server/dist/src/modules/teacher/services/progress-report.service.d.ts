import { PrismaService } from 'src/db/prisma.service';
export declare class TeacherProgressReportService {
    private prisma;
    constructor(prisma: PrismaService);
    listReports(teacherId: string, params?: {
        status?: string;
        periodLabel?: string;
    }): Promise<({
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
        } & {
            grade: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            studentCode: string | null;
            address: string | null;
            schoolId: string;
            parentId: string | null;
            scholarshipId: string | null;
        };
        class: {
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
            roomId: string | null;
            expectedStartDate: Date | null;
            status: string;
            gradeId: string | null;
            maxStudents: number | null;
            teacherId: string | null;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            feeStructureId: string | null;
            classCode: string | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
        };
    } & {
        grade: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        status: string;
        teacherId: string | null;
        studentId: string;
        classId: string | null;
        periodStart: Date;
        periodEnd: Date;
        attendanceRate: number | null;
        generatedAt: Date | null;
        reportType: string;
        periodLabel: string;
        averageScore: number | null;
        trend: string | null;
        overallComment: string | null;
        publishedAt: Date | null;
    })[]>;
    updateDraft(teacherId: string, reportId: string, data: {
        overallComment?: string;
    }): Promise<{
        grade: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        status: string;
        teacherId: string | null;
        studentId: string;
        classId: string | null;
        periodStart: Date;
        periodEnd: Date;
        attendanceRate: number | null;
        generatedAt: Date | null;
        reportType: string;
        periodLabel: string;
        averageScore: number | null;
        trend: string | null;
        overallComment: string | null;
        publishedAt: Date | null;
    }>;
    publish(teacherId: string, reportId: string, data: {
        overallComment?: string;
    }): Promise<{
        grade: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        status: string;
        teacherId: string | null;
        studentId: string;
        classId: string | null;
        periodStart: Date;
        periodEnd: Date;
        attendanceRate: number | null;
        generatedAt: Date | null;
        reportType: string;
        periodLabel: string;
        averageScore: number | null;
        trend: string | null;
        overallComment: string | null;
        publishedAt: Date | null;
    }>;
    bulkPublish(teacherId: string, reportIds: string[]): Promise<{
        published: number;
        message: string;
    }>;
}
