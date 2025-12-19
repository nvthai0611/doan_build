import { PrismaService } from '../../../db/prisma.service';
export declare class PublicTeachersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTeachers(params?: {
        subjectId?: string;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            subject: string;
            subjects: string[];
            experience: number;
            students: number;
            rating: number;
            avatar: string;
            classesStatus: string[];
            assignedClasses: {
                className: string;
                classCode: string;
                status: string;
            }[];
        }[];
        message: string;
    }>;
}
