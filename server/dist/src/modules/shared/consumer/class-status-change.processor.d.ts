import { Job } from 'bull';
interface ClassStatusChangeEmailData {
    to: string;
    parentName: string;
    studentName: string;
    className: string;
    subjectName: string;
    teacherName?: string;
    oldStatus: string;
    newStatus: string;
    statusLabel: string;
    statusColor: string;
    statusIcon: string;
    classId: string;
}
export declare class ClassStatusChangeProcessor {
    handleSendClassStatusChangeEmail(job: Job<ClassStatusChangeEmailData>): Promise<{
        success: boolean;
        message: string;
        classId: string;
        sentTo: string;
        duration: number;
    }>;
}
export {};
