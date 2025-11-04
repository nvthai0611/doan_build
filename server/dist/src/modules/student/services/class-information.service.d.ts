import { PrismaService } from 'src/db/prisma.service';
export declare class ClassInformationService {
    private prisma;
    constructor(prisma: PrismaService);
    getEnrolledSubjectsByStudent(studentId: string): Promise<{
        id: string;
        name: string;
        description: string;
        code: string;
    }[]>;
    getStudentsOfClassForStudent(classId: string): Promise<{
        id: string;
        userId: string;
        fullName: string;
        email: string;
        studentCode: string;
        enrolledAt: Date;
        status: string;
    }[]>;
    getClassDetailForStudent(classId: string): Promise<{
        id: string;
        name: string;
        description: string;
        subject: {
            id: string;
            name: string;
            description: string | null;
            code: string;
        };
        room: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        };
        startDate: Date;
        endDate: Date;
        maxStudents: number;
        currentStudents: number;
        teacher: {
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
    }>;
}
