import { Job } from 'bull';
import { PrismaService } from '../../../db/prisma.service';
import { EmailJobData } from './email-queue.service';
export declare class EmailProcessor {
    private prisma;
    constructor(prisma: PrismaService);
    handleTeacherAssignmentEmail(job: Job<EmailJobData>): Promise<{
        success: boolean;
        message: string;
        data: {
            teacherEmail: string;
            classId: string;
            className: string;
            messageId: any;
        };
    }>;
    private getStatusLabel;
}
