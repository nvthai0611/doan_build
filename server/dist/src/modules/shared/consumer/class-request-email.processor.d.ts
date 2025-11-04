import { Job } from 'bull';
interface ClassRequestApprovalEmailData {
    to: string;
    studentName: string;
    parentName: string;
    className: string;
    subjectName: string;
    teacherName?: string;
    startDate?: string;
    schedule?: any;
    username?: string;
    password?: string;
    requestId: string;
    studentId: string;
    classId: string;
}
interface ClassRequestRejectionEmailData {
    to: string;
    studentName: string;
    parentName: string;
    className: string;
    subjectName: string;
    reason?: string;
    requestId: string;
    studentId: string;
    classId: string;
}
export declare class ClassRequestEmailProcessor {
    handleSendApprovalEmail(job: Job<ClassRequestApprovalEmailData>): Promise<{
        success: boolean;
        message: string;
        studentId: string;
        classId: string;
        requestId: string;
        sentTo: string;
        duration: number;
    }>;
    handleSendRejectionEmail(job: Job<ClassRequestRejectionEmailData>): Promise<{
        success: boolean;
        message: string;
        studentId: string;
        classId: string;
        requestId: string;
        sentTo: string;
        duration: number;
    }>;
}
export {};
