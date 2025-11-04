import { Job } from 'bull';
interface TeacherAccountEmailData {
    to: string;
    teacherName: string;
    username: string;
    email: string;
    password: string;
    teacherCode: string;
    teacherId: string;
}
export declare class TeacherAccountProcessor {
    handleSendTeacherAccountEmail(job: Job<TeacherAccountEmailData>): Promise<{
        success: boolean;
        message: string;
        teacherId: string;
        sentTo: string;
        duration: number;
    }>;
}
export {};
