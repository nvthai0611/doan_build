import { PrismaService } from 'src/db/prisma.service';
export declare class IncidentHandleService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listIncidents(options: {
        page: number;
        limit: number;
        status?: string;
        severity?: string;
    }): Promise<{
        data: ({
            class: {
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
            reportedBy: {
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
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            description: string;
            severity: string;
            status: string;
            classId: string | null;
            date: Date;
            time: string;
            incidentType: string;
            location: string | null;
            actionsTaken: string | null;
            studentsInvolved: string | null;
            witnessesPresent: string | null;
            reportedById: string;
        })[];
        message: string;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateStatus(id: string, status: string): Promise<{
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            description: string;
            severity: string;
            status: string;
            classId: string | null;
            date: Date;
            time: string;
            incidentType: string;
            location: string | null;
            actionsTaken: string | null;
            studentsInvolved: string | null;
            witnessesPresent: string | null;
            reportedById: string;
        };
        message: string;
    }>;
}
