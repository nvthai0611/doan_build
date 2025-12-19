import { TeacherFeedbackService } from '../services/teacher-feedback.service';
export declare class TeacherFeedbackController {
    private readonly service;
    constructor(service: TeacherFeedbackService);
    list(query: any): Promise<{
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
