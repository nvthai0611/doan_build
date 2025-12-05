import { Queue } from 'bull';
import { PrismaService } from '../../../db/prisma.service';
export interface EmailJobData {
    type: 'teacher_assignment';
    classId: string;
    teacherId: string;
    priority?: number;
    delay?: number;
}
export declare class EmailQueueService {
    private emailQueue;
    private prisma;
    constructor(emailQueue: Queue, prisma: PrismaService);
    addTeacherAssignmentEmailJob(classId: string, teacherId: string, options?: {
        priority?: number;
        delay?: number;
    }): Promise<{
        success: boolean;
        jobId: import("bull").JobId;
        message: string;
    }>;
    getQueueInfo(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        total: number;
    }>;
    clearQueue(): Promise<{
        success: boolean;
        message: string;
    }>;
    removeJob(jobId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
