import { PrismaService } from 'src/db/prisma.service';
interface CreateFeedbackDto {
    teacherId: string;
    classId?: string;
    rating: number;
    comment?: string;
    categories?: any;
    isAnonymous?: boolean;
}
export declare class ChildTeacherFeedbackService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAvailableTeachersForChild(userId: string, childId: string): Promise<any[]>;
    getFeedbacksForChild(userId: string, childId: string): Promise<{
        id: string;
        teacherId: string;
        classId: string;
        rating: number;
        comment: string;
        categories: any;
        isAnonymous: boolean;
        date: string;
        status: string;
        teacherName: string;
        className: string;
    }[]>;
    createFeedbackForChild(userId: string, childId: string, dto: CreateFeedbackDto): Promise<{
        id: string;
    }>;
}
export {};
