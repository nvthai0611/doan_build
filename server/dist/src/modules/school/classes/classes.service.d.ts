import { PrismaService } from 'src/db/prisma.service';
export declare class ClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    getClassByTeacherId(teacherId: string): Promise<{
        teacherId: string;
        teacher: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
        room: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        };
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
    }[]>;
    findOne(id: string): Promise<{
        teacherId: string;
        room: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        } | {
            id: string;
            name: string;
            capacity: number;
        };
        teacher: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
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
    }>;
}
