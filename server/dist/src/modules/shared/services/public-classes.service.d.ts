import { PrismaService } from '../../../db/prisma.service';
export declare class PublicClassesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRecruitingClasses(query: {
        page: number;
        limit: number;
        subjectId?: string;
        gradeId?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            classCode: string;
            description: string;
            status: string;
            maxStudents: number;
            currentStudents: number;
            pendingRequests: number;
            completedSessionsCount: number;
            subject: {
                id: string;
                name: string;
            };
            grade: {
                id: string;
                name: string;
            };
            teacher: {
                id: string;
                fullName: string;
                avatar: string;
            };
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue;
            expectedStartDate: Date;
            actualStartDate: Date;
            actualEndDate: Date;
            requirePassword: boolean;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: string;
    }>;
    getSubjects(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
        }[];
        message: string;
    }>;
    getGrades(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
        }[];
        message: string;
    }>;
}
