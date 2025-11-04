import { PrismaService } from 'src/db/prisma.service';
export declare class ClassInformationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getChildClasses(parentUserId: string, studentId: string): Promise<{
        id: string;
        name: string;
        classCode: string;
        status: string;
        progress: number;
        currentStudents: any;
        maxStudents: number;
        description: string;
        teacher: {
            id: string;
            user: {
                fullName: string;
                email: string;
            };
        };
        room: {
            name: string;
        };
        subject: {
            name: string;
            code: string;
        };
        grade: {
            name: string;
            level: number;
        };
        schedule: any[];
        startDate: Date;
        endDate: any;
        studentName: string;
        enrolledAt: Date;
        totalSessions: number;
        completedSessions: number;
    }[]>;
    getAllChildrenClasses(parentUserId: string): Promise<{
        id: string;
        name: string;
        classCode: string;
        status: string;
        progress: number;
        currentStudents: any;
        maxStudents: number;
        description: string;
        teacher: {
            id: string;
            user: {
                fullName: string;
                email: string;
            };
        };
        room: {
            name: string;
        };
        subject: {
            name: string;
            code: string;
        };
        grade: {
            name: string;
            level: number;
        };
        schedule: any[];
        startDate: Date;
        endDate: any;
        studentName: string;
        enrolledAt: Date;
        totalSessions: number;
        completedSessions: number;
    }[]>;
}
