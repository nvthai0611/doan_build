import { ChildTeacherFeedbackService } from '../services/child-teacher-feedback.service';
export declare class ChildTeacherFeedbackController {
    private readonly service;
    constructor(service: ChildTeacherFeedbackService);
    getTeachers(req: any, childId?: string): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getFeedbacks(req: any, childId: string): Promise<{
        success: boolean;
        data: {
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
        }[];
        message: string;
    }>;
    createFeedback(req: any, childId: string, body: any): Promise<{
        success: boolean;
        data: {
            id: string;
        };
        message: string;
    }>;
}
