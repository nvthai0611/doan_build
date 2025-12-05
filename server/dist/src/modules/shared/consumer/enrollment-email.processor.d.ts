import { Job } from 'bull';
interface EnrollmentEmailData {
    to: string;
    studentName: string;
    parentName: string;
    className: string;
    subjectName: string;
    teacherName?: string;
    startDate?: string;
    schedule?: any;
    enrollmentStatus: string;
    studentId: string;
    classId: string;
    isTransfer?: boolean;
    oldClassName?: string;
    transferReason?: string;
}
export declare class EnrollmentEmailProcessor {
    handleSendEnrollmentEmail(job: Job<EnrollmentEmailData>): Promise<{
        success: boolean;
        message: string;
        studentId: string;
        classId: string;
        sentTo: string;
        duration: number;
    }>;
}
export {};
