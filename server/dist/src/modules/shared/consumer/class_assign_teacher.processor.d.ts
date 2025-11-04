import { Job } from 'bull';
interface ClassAssignTeacherEmailData {
    to: string;
    teacherId: string;
    teacherName: string;
    classId: string;
    className: string;
    subject?: string;
    startDate?: string;
    schedule?: any;
}
interface ClassRemoveTeacherEmailData {
    to: string;
    teacherId: string;
    teacherName: string;
    classId: string;
    className: string;
    reason?: string;
}
export declare class ClassAssignTeacherProcessor {
    handleSendClassAssignTeacherEmail(job: Job<ClassAssignTeacherEmailData>): Promise<{
        success: boolean;
        message: string;
        teacherId: string;
        classId: string;
        sentTo: string;
        duration: number;
    }>;
    handleSendClassRemoveTeacherEmail(job: Job<ClassRemoveTeacherEmailData>): Promise<{
        success: boolean;
        message: string;
        teacherId: string;
        classId: string;
        sentTo: string;
        duration: number;
    }>;
}
export {};
