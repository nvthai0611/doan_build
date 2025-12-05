import { PrismaService } from '../../../db/prisma.service';
export declare class TeacherFeedbackService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: any): Promise<{
        data: {
            id: string;
            teacherId: string;
            teacherName: string;
            teacherAvatar: string;
            parentName: string;
            parentEmail: string;
            studentName: string;
            className: string;
            rating: number;
            categories: any;
            comment: string;
            isAnonymous: boolean;
            status: any;
            createdAt: string;
        }[];
        message: string;
    }>;
}
